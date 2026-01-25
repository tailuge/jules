# Initial Concept
D research how rlm works

# Product Definition

## Target Users
- Developers building LLM-powered applications that need to process large documents efficiently.

## Core Goals
- Research and demonstrate the Recursive Language Model (RLM) architecture as described in Zhang et al.
- Provide a minimal and understandable "control plane" harness written in Bash.
- Enable the processing of large text files (external environment) that exceed standard LLM context windows.
- Achieve cost efficiency by utilizing smaller/cheaper models for context scanning and partitioning.

## Key Features
- **Minimal Bash Harness:** A simple, readable shell script that implements the RLM loop.
- **LLM Interoperability:** Uses Simon Willison's `llm` package to easily switch between different LLM providers and models.
- **Recursive Sub-calls:** Supports recursive nesting, where the root model can initiate sub-calls that are themselves instances of the RLM loop.
- **Shell-based Toolbox:** Provides the LLM with standard GNU/Linux utilities (`grep`, `head`, `tail`, `sed`) to interact with the context environment.
- **State Management:** Maintains a REPL-like history of shell command outputs to provide context for the next iteration of the loop.

## Success Criteria
- The harness can successfully answer questions about a large text file by recursively scanning and partitioning it.
- The script remains under a specific complexity threshold to ensure it is easy for developers to study and modify.
