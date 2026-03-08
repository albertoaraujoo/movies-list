---
name: nextjs-client-component-isolation
description: Enforces Server Components by default and isolates client interactivity into small dedicated components. Use when building or refactoring Next.js App Router pages, adding click handlers or local state, or when optimizing bundle size and Time to Interactive (TTI).
---

# Next.js Architecture — Client Component Isolation

## Princípio

Adote **Server Components por padrão**. Páginas e layouts permanecem no servidor; apenas as partes que precisam de interatividade no cliente recebem `'use client'`.

## Regra de ouro

**Nunca** transforme uma página inteira em Client Component só para um evento de clique ou um pedaço de estado. Isso aumenta o bundle desnecessariamente e piora o TTI.

## Metodologia

1. **Identificar** a parte interativa: botões, inputs, modais, formulários, toggles, etc.
2. **Extrair** essa parte para um componente dedicado.
3. **Marcar** apenas esse componente com a diretiva `'use client'` no topo do arquivo.
4. **Manter** no servidor: páginas, layouts e componentes que só buscam dados ou renderizam estático.

## Composição

- Componentes que **buscam dados** (fetch, DB, APIs) ficam como **Server Components**.
- Dados são passados do Server Component para o Client Component **via props**.
- O Client Component não deve fazer data fetching para aquela árvore; ele recebe os dados já prontos.

## Exemplo de estrutura

**Evitar (página inteira client):**

```tsx
'use client'

export default function Page() {
  const [open, setOpen] = useState(false)
  const data = useFetch(...) // pior: fetch no cliente
  return (
    <>
      <h1>{data.title}</h1>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

**Preferir (isolamento):**

```tsx
// app/page.tsx — Server Component (sem 'use client')
import { getData } from '@/lib/data'
import { PageActions } from './page-actions'

export default async function Page() {
  const data = await getData()
  return (
    <>
      <h1>{data.title}</h1>
      <PageActions initialData={data} />
    </>
  )
}
```

```tsx
// page-actions.tsx — Client Component (apenas o interativo)
'use client'

import { useState } from 'react'
import { Modal } from '@/components/modal'

export function PageActions({ initialData }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

## Checklist ao implementar

- [ ] A página ou layout permanece sem `'use client'`?
- [ ] Apenas componentes que usam estado, eventos ou hooks do cliente têm `'use client'`?
- [ ] Dados vêm do servidor e são passados por props para os Client Components?
- [ ] Nenhum Client Component desnecessário envolve árvores grandes (ex.: toda a lista ou todo o layout)?

## Objetivo

Minimizar o JavaScript enviado ao navegador e otimizar o **Time to Interactive (TTI)**, mantendo a interatividade onde ela é necessária.
