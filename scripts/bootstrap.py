#!/usr/bin/env python3


def main():
    print("jee-agentic-dev rapid product bootstrap")
    print()
    print("For a brand-new product, do PROJECT INCEPTION first.")
    print("Define:")
    print("  - real problem + intended user")
    print("  - hero user journey + demo-critical path")
    print("  - product impression + technical credibility hooks")
    print("  - minimum credible architecture")
    print("  - a small vertical-slice backlog")
    print("  - docs/PROJECT.md, docs/architecture/SYSTEM.md, .ai/project.json")
    print()
    print("Validate operational configuration:")
    print("  python scripts/agentctl.py project validate")
    print()
    print("Only after .ai/project.json is INCEPTION_READY:")
    print('  python scripts/agentctl.py task create CORE-001 "Primary user journey"')
    print("  python scripts/agentctl.py git prepare CORE-001")
    print("  python scripts/agentctl.py task advance CORE-001")


if __name__ == "__main__":
    main()
