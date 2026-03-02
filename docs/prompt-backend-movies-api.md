# Prompt para colar no projeto do backend (API de filmes)

Copie o texto abaixo e use na janela do backend para obter as informações necessárias para o frontend (CineList) funcionar corretamente com filtros e carga inicial.

---

## Texto do prompt

```
Preciso alinhar o backend da API de filmes com o frontend (CineList). Me dê as informações abaixo de forma objetiva:

1) **GET /movies** (lista paginada):
   - Quais query params são aceitos? (page, limit, search, watched, year, director, etc.)
   - Quando envio `watched=false`, a API retorna só filmes NÃO assistidos?
   - Quando envio `watched=true`, retorna só assistidos?
   - Quando NÃO envio `watched`, retorna TODOS os filmes (assistidos + não assistidos)?
   - Formato da resposta: é `{ data: Movie[], meta: { total, page, limit, totalPages } }` ou outro? Me mostre o DTO/exemplo.

2) **POST /movies** (criar filme):
   - Qual o valor padrão do campo `watched` quando não é enviado no body? (deve ser `false` para filmes novos.)
   - O schema/DTO de criação aceita `watched`? Se sim, ao criar com `watched: true` o filme já nasce como assistido?

3) **PATCH /movies/:id** (atualizar filme):
   - Ao enviar `{ watched: true }` o filme passa a ser considerado assistido e some da lista de "não assistidos" quando o front chama GET /movies?watched=false?

4) **Filtro por usuário:**
   - A lista GET /movies já filtra por usuário autenticado (token JWT)? Ou existe outro mecanismo?

Responde em tópicos curtos e, se possível, indica o arquivo ou trecho do código onde isso está definido (ex: controller, DTO, service) para eu poder ajustar se algo estiver diferente do esperado.
```

---

## O que o frontend espera (referência)

- **GET /movies** sem `watched` → todos os filmes do usuário.
- **GET /movies?watched=false** → só não assistidos.
- **GET /movies?watched=true** → só assistidos.
- **POST /movies** (criar) → filme novo deve ter `watched: false` por padrão.
- Resposta paginada: `{ data: Movie[], meta: { total, page, limit, totalPages } }`.

Se o backend devolver algo diferente (ex.: default `watched: true` ao criar, ou filtro `watched` com outro comportamento), o front pode parecer “vazio” ao carregar ou ao usar “Não assistidos”.
