# Phala Verifiable AI

A Next.js chat application demonstrating verifiable AI responses using Phala Network's confidential computing infrastructure.

## Overview

This application provides a chat interface that leverages Phala Cloud for verifiable AI interactions. Each AI response includes cryptographic verification, ensuring the integrity and authenticity of the generated content.

## Features

- Real-time chat interface with streaming responses
- Cryptographic verification of AI-generated messages
- Built-in verification panel displaying proof data
- Support for on-chain verification

## Getting Started

Install dependencies:

```bash
bun install
```

Create a `.env.local` file with your configuration:

```bash
NEXT_PUBLIC_PHALA_ENDPOINT=your_endpoint_here
```

Run the development server:

```bash
bun dev
```

Open [http://localhost:3000/chat](http://localhost:3000/chat) to access the chat interface.

## Build

```bash
bun run build
bun start
```

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Viem for blockchain interactions

## License

MIT
