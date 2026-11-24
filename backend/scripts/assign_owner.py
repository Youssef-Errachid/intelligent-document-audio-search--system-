"""Assign existing ownerless documents to a user (one-time auth migration).

Creates the user if the email does not exist (as admin), sets owner_id on all
documents that lack one in MongoDB, then updates the matching Solr chunks in
place (atomic updates, no re-embedding needed).

Usage:
    python -m scripts.assign_owner --email admin@example.com --password "secret123" --name Admin
"""

import argparse
import asyncio

import httpx

from app.auth.security import hash_password, utcnow_naive
from app.config import settings
from app.database import client, database


async def get_or_create_user(email: str, password: str | None, name: str) -> dict:
    users = database["users"]
    user = await users.find_one({"email": email.lower()})
    if user:
        print(f"Using existing user {email} ({user['_id']})")
        return user
    if not password:
        raise SystemExit("User does not exist: --password is required to create it.")
    result = await users.insert_one(
        {
            "email": email.lower(),
            "password_hash": hash_password(password),
            "name": name,
            "role": "admin",
            "is_active": True,
            "created_at": utcnow_naive(),
        }
    )
    user = await users.find_one({"_id": result.inserted_id})
    print(f"Created admin user {email} ({user['_id']})")
    return user


async def solr_chunk_ids(doc_id: str) -> list[str]:
    async with httpx.AsyncClient(timeout=30) as http:
        response = await http.post(
            f"{settings.solr_url}/select",
            data={"q": f'doc_id:"{doc_id}"', "fl": "id", "rows": 10000},
        )
        response.raise_for_status()
        return [doc["id"] for doc in response.json()["response"]["docs"]]


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", default=None)
    parser.add_argument("--name", default="Admin")
    args = parser.parse_args()

    user = await get_or_create_user(args.email, args.password, args.name)
    owner_id = str(user["_id"])

    collection = database["documents"]
    query = {"owner_id": {"$exists": False}}
    total = await collection.count_documents(query)
    print(f"{total} documents without owner")

    updated_chunks = 0
    async for doc in collection.find(query, {"_id": 1}):
        doc_id = str(doc["_id"])
        await collection.update_one(
            {"_id": doc["_id"]}, {"$set": {"owner_id": user["_id"]}}
        )
        chunk_ids = await solr_chunk_ids(doc_id)
        if chunk_ids:
            payload = [
                {"id": chunk_id, "owner_id": {"set": owner_id}} for chunk_id in chunk_ids
            ]
            async with httpx.AsyncClient(timeout=60) as http:
                response = await http.post(
                    f"{settings.solr_url}/update",
                    params={"commit": "true"},
                    json=payload,
                )
                response.raise_for_status()
            updated_chunks += len(chunk_ids)
        print(f"  {doc_id}: owner set ({len(chunk_ids)} chunks)")

    print(f"Done. {total} documents, {updated_chunks} Solr chunks updated.")
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
