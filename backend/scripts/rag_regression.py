import sys
import time

import httpx

BASE_URL = "http://localhost:8000"
TIMEOUT = 300  # same as llm_timeout

CASES = [
    {
        "question": "What technologies are used in the LogiTrack project?",
        "expected_source": "LogiTrack_Solutions_Project_Plan.pdf",
        "answer_contains": "Spring Boot",
    },
    {
        "question": "ماذا يقول التسجيل عن الأمثال الشعبية؟",
        "expected_source": "001a38fc.wav",
    },
    {
        "question": "Quel est l impact du changement climatique sur les récoltes ?",
        "expected_source": "rapport_climat.pdf",
    },
    {"question": "hello", "expected_source": None},
    {"question": "recette du couscous", "expected_source": None},
    {"question": "Who won the 2018 football world cup?", "expected_source": None},
]


def run_case(client: httpx.Client, case: dict) -> tuple[list[str], float]:

    """Ask one question. Returns (problems found, seconds)."""
    start = time.time()
    response = client.post(
        f"{BASE_URL}/api/assistant/ask", json={"question": case["question"]}
    )
    seconds = time.time() - start

    if response.status_code != 200:
        return [f"HTTP {response.status_code}"], seconds

    data = response.json()
    paths = [source["source_path"] for source in data["sources"]]
    problems = []

    expected = case["expected_source"]
    if expected is None:
        if paths:
            problems.append(f"expected no sources, got {paths}")
    elif not any(expected in path for path in paths):
        problems.append(f"expected source '{expected}', got {paths}")

    needle = case.get("answer_contains")
    if needle and needle.lower() not in data["answer"].lower():
        problems.append(f"answer does not contain '{needle}'")

    return problems, seconds


def main() -> int:
    failures = 0
    with httpx.Client(timeout=TIMEOUT) as client:
        for case in CASES:

            try:
                problems, seconds = run_case(client, case)
            except httpx.ConnectError:
                print(f"Cannot reach {BASE_URL}. Is uvicorn running?")
                return 2

            status = "FAIL" if problems else "PASS"
            print(f"{status}  {seconds:5.1f}s  {case['question']}")
            for problem in problems:
                print(f"        - {problem}")
            failures += bool(problems)

    print(f"\n{len(CASES) - failures}/{len(CASES)} passed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())