The most efficient way to build this is to treat the LLM as a **stateful pipe**. We will use Simon Willison’s `llm` tool as the backend because its SQLite logging (`llm logs`) acts as a perfect "flight recorder" for your recursive agent.

The following report is designed to be fed into **Google Jules** to execute the implementation.

---

# Project: Minimal Recursive LLM Harness (`rlm`)

**Objective:** Build a minimal bash-based agent loop that uses `llm` to interact with models and can execute local tools (`grep`, `cat`, `ls`) to manipulate its own context.

## 🛠 Project Components

* `rlm.sh`: The main loop logic.
* `context.md`: The rolling log of Thought → Action → Observation.
* `mock_llm.sh`: A drop-in replacement for the `llm` command for hermetic testing.

---

## 📝 Implementation Roadmap 

### Phase 1: Environment & Tooling

* [ ] Install wilsons `llm` via `uv` or `pipx`.
* [ ] Configure `llm-ollama` (for local dev) and `llm-gemini` (for cloud interop).
* [ ] Initialize `context.md` with a System Prompt defining the "Tool Protocol".

### Phase 2: Core Harness Logic

* [ ] **State Management:** Create a script that reads the last  lines of `context.md`.
* [ ] **The Loop:** 1. Send context to `llm`.
2. Parse output for `ACTION: <command>`.
3. Execute `<command>` and capture `STDOUT/STDERR`.
4. Append result as `OBSERVATION: <output>` to `context.md`.
* [ ] **Recursion Limit:** Implement a simple counter to prevent infinite loops (and infinite API bills).

### Phase 3: Tooling & Sandbox

* [ ] Implement `grep` wrapper that truncates output.
* [ ] Implement a `rewrite_context` tool for the LLM to prune its own history.

### Phase 4: Testing & Mocking

* [ ] Create `tests/mock_llm.sh` that returns deterministic `ACTION` strings.
* [ ] Implement a `test_harness.sh` that swaps `llm` for the mock via `PATH` manipulation.

---

## 🤖 Prompt 

Copy and paste the following into Jules to begin:

> "I am building a minimal recursive LLM agent in Bash using the `llm` CLI.
> **The Protocol:**
> The LLM must output its response in this format:
> `THOUGHT: <reasoning>`
> `ACTION: <shell command>`
> **Your Task:**
> 1. Write `rlm.sh`. It should use `tail -n 50 context.md | llm -s "$SYSTEM_PROMPT"` to get the next step.
> 2. Implement the parser that extracts the string after `ACTION:` and runs it using `eval`.
> 3. Implement a mocking scheme: If an environment variable `MOCK=1` is set, the script should call `./mock_llm.sh` instead of the real `llm` binary.
> 4. Ensure the script is 'Pi 5 friendly'—use standard tools like `sed`, `grep`, and `awk`.
> 
> 
> Start by creating the `rlm.sh` scaffold and the `SYSTEM_PROMPT` variable."

---

## 🧪 Mocking Strategy

To test without hitting APIs, Jules should implement `mock_llm.sh` like this:

```bash
#!/bin/bash
# mock_llm.sh
INPUT=$(cat -)
if [[ "$INPUT" == *"search"* ]]; then
  echo "THOUGHT: I need to find the version."
  echo "ACTION: grep 'version' package.json"
else
  echo "THOUGHT: Task complete."
  echo "ACTION: exit"
fi

```
