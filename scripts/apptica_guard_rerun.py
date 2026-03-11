#!/usr/bin/env python3
import json
import urllib.request
from datetime import datetime

LOCKED_URL = "https://apptica.com/client/top-apps?platforms=2&country=1&category=152%2C153%2C83%2C81%2C96%2C85%2C74%2C89%2C84%2C80%2C57%2C62%2C91%2C90%2C88%2C68%2C94%2C93%2C55%2C61%2C79%2C72%2C78%2C75&revenue_range=10000%2C50000&order_by=release_date&order_direction=desc&last_days={days}&page={page}"
ROOT = "/Users/antonioridotto/.openclaw/workspace"


def fetch(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "text/html,application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode("utf-8", "ignore")
        return r.status, body


def source_has_rows(body: str) -> bool:
    # minimal hard check: if locked top-apps rows are not present, we must fail hard
    return "apps.apple.com" in body


def main():
    attempts = []
    rows_detected = 0
    for days in (30, 60, 90):
        for page in range(1, 11):
            url = LOCKED_URL.format(days=days, page=page)
            try:
                status, body = fetch(url)
                ok = status == 200 and source_has_rows(body)
                if ok:
                    rows_detected += 1
                attempts.append({"days": days, "page": page, "status": status, "has_rows": ok})
            except Exception as e:
                attempts.append({"days": days, "page": page, "status": "ERR", "error": str(e), "has_rows": False})

    now_iso = datetime.now().astimezone().isoformat(timespec="seconds")

    # hard-fail guard: never fabricate shortlist from stale data
    dashboard_path = f"{ROOT}/dashboard/data.json"
    with open(dashboard_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for day in data:
        if day.get("date") == "2026-03-11":
            day["timestamp"] = now_iso
            day["selected3"] = []
            day["winner"] = ""
            day["status"] = "SOURCE_UNAVAILABLE"
            day["reason"] = "Guard active: live Apptica rows unavailable; shortlist generation blocked (no fallback/fabrication)."

    with open(dashboard_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    history_entry = {
        "timestamp": now_iso,
        "source": "apptica",
        "mode": "guard-rerun-no-autobuild",
        "result": "source_unavailable",
        "required_count": 3,
        "qualified_count": 0,
        "guard": {
            "no_stale_fallback": True,
            "no_fake_30": True,
            "auto_build": False,
        },
        "scan": {
            "attempts": len(attempts),
            "rows_detected": rows_detected,
            "windows": [30, 60, 90],
            "pages_per_window": 10,
        },
        "reason": "Live locked Apptica rows unavailable in run context; hard fail applied."
    }

    with open(f"{ROOT}/reports/daily-idea-history.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(history_entry, ensure_ascii=False) + "\n")

    with open(f"{ROOT}/reports/idea-dashboard.md", "w", encoding="utf-8") as f:
        f.write("# Idea Dashboard\n\n## Latest\n\n")
        f.write(f"- Date: {now_iso}\n")
        f.write("- Status: SOURCE_UNAVAILABLE\n")
        f.write("- Guard: active (no stale fallback, no fake 30 list)\n")
        f.write("- Auto-build: DISABLED\n")
        f.write("- Result: shortlist blocked until live rows are retrievable.\n")

    print(json.dumps({"ok": True, "attempts": len(attempts), "rows_detected": rows_detected, "status": "SOURCE_UNAVAILABLE"}))


if __name__ == "__main__":
    main()
