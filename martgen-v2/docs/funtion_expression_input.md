# Understanding n8n Expression System (fx) and Loop Node

## Expression System (fx) - How n8n Handles `={{ }}` Expressions

## Overview
n8n's expression system allows dynamic values using the `={{ }}` syntax. The system spans from UI input to backend evaluation with security sandboxing.

## Expression System Architecture

### 1. Expression Syntax Detection
**File:** `packages/workflow/src/expressions/expression-helpers.ts`

Expressions MUST start with `=`:
```typescript
export const isExpression = (expr: unknown): expr is string => {
  if (typeof expr !== 'string') return false;
  return expr.charAt(0) === '=';
};
```

Examples:
- `={{ $json.name }}` - Valid expression
- `Hello {{ $json.name }}` - Not an expression (no `=` prefix)
- `=$json.total * 1.1` - Valid expression (no brackets needed for simple cases)

### 2. Frontend UI Components

#### Main Expression Editor
**File:** `packages/frontend/editor-ui/src/features/ndv/parameters/components/ExpressionParameterInput.vue`

Features:
- Detects when user types `=` to enable expression mode
- Live expression output preview
- Drag-and-drop from workflow data
- Integration with CodeMirror for syntax highlighting

#### Inline Expression Editor
**File:** `packages/frontend/editor-ui/src/features/shared/editors/components/InlineExpressionEditor/InlineExpressionEditorInput.vue`

CodeMirror extensions:
- `n8nLang()` - n8n-specific syntax highlighting
- `n8nAutocompletion()` - Autocomplete for `$json`, `$node`, etc.
- `expressionCloseBrackets()` - Auto-close `{{ }}`
- `dropCursor()` - Drag mapping visualization

### 3. Expression Parsing: `{{ }}` Brackets

**File:** `packages/workflow/src/extensions/expression-parser.ts`

Splits expressions into text and code chunks:

```typescript
// Input: "Hello {{ $json.name }}, total: {{ $json.total }}"
// Output:
[
  { type: 'text', text: 'Hello ' },
  { type: 'code', text: '$json.name', hasClosingBrackets: true },
  { type: 'text', text: ', total: ' },
  { type: 'code', text: '$json.total', hasClosingBrackets: true }
]
```

### 4. Backend Expression Evaluation

**File:** `packages/workflow/src/expression.ts`

Main `Expression` class orchestrates evaluation:

```typescript
resolveSimpleParameterValue(parameterValue, ...) {
  // 1. Check if it's an expression
  if (!isExpression(parameterValue)) return parameterValue;

  // 2. Strip '=' prefix
  parameterValue = parameterValue.substr(1);

  // 3. Create context with WorkflowDataProxy
  const dataProxy = new WorkflowDataProxy(...);
  const data = dataProxy.getDataProxy();

  // 4. Initialize security (allowlist/denylist)
  Expression.initializeGlobalContext(data);

  // 5. Add extension functions
  data.extend = extend;
  Object.assign(data, extendedFunctions);

  // 6. Transform extended syntax
  const extendedExpression = extendSyntax(parameterValue);

  // 7. Evaluate with Tournament
  return this.renderExpression(extendedExpression, data);
}
```

**File:** `packages/workflow/src/expression-evaluator-proxy.ts`

Uses Tournament library for secure evaluation:
```typescript
import { Tournament } from '@n8n/tournament';

const tournamentEvaluator = new Tournament(errorHandler, undefined, undefined, {
  before: [FunctionThisSanitizer],
  after: [PrototypeSanitizer, DollarSignValidator]
});

export const evaluateExpression = (expr, data) => {
  return tournamentEvaluator.execute(expr, data);
};
```

### 5. Context Variables ($json, $node, etc.)

**File:** `packages/workflow/src/workflow-data-proxy.ts`

Available variables in expressions:

```javascript
// Current item data
$json         // Current item's JSON data
$binary       // Current item's binary data
$data         // Alias for $json

// Indexing
$itemIndex    // Current item index (0-based)
$runIndex     // Current run index

// Node access
$node         // Access other node data: $node.NodeName.json
$parameter    // Current node's parameters
$self         // Self-data in scripting nodes
$prevNode     // Previous node in execution

// Workflow metadata
$workflow     // Workflow info (id, name, active)
$mode         // Execution mode ('manual', 'trigger', etc.)

// Functions
$item(index)           // Get specific item
$items(nodeName)       // Get all items from node
$now                   // Current time (Luxon DateTime)
$today                 // Today at 00:00:00
$jmesPath(data, query) // JMESPath queries
$evaluateExpression(expr) // Recursive evaluation

// Date/Time objects
DateTime, Duration, Interval // Luxon library
```

### 6. Expression Extensions (Method Chaining)

**File:** `packages/workflow/src/extensions/expression-extension.ts`

Transforms method syntax into function calls:

```javascript
// User writes:
{{ $json.items.map(i => i.price).filter(p => p > 100) }}

// Gets transformed to:
{{ extend(extend($json.items, 'map', [i => i.price]), 'filter', [p => p > 100]) }}
```

**Available methods by type:**

**String:** `.trim()`, `.toUpperCase()`, `.toLowerCase()`, `.split()`, `.replace()`, `.includes()`, `.substring()`, etc.

**Array:** `.map()`, `.filter()`, `.find()`, `.reduce()`, `.sort()`, `.slice()`, `.concat()`, `.join()`, etc.

**Number:** `.toFixed()`, `.toPrecision()`, `.toExponential()`

**Object:** `.keys()`, `.values()`, `.entries()`, `.hasOwnProperty()`

**Date (Luxon):** `.toISO()`, `.toFormat()`, `.plus()`, `.minus()`, `.diff()`, etc.

**Built-in functions:**
```javascript
min(...args)           // Minimum value
max(...args)           // Maximum value
average(...args)       // Average
not(value)            // Logical NOT
ifEmpty(value, def)   // Default if empty
zip(keys, values)     // Create object
numberList(start, end) // Range array
```

### 7. Security Sandboxing

**File:** `packages/workflow/src/expression-sandboxing.ts`

#### Denylist (Blocked):
```javascript
document, window, globalThis, eval, Function, setTimeout,
setInterval, fetch, XMLHttpRequest, Promise, Proxy, etc.
```

#### Allowlist (Permitted):
```javascript
Date, DateTime, Object, Array, Map, Set, String, RegExp,
Math, Number, JSON, Intl, etc.
```

#### Security Hooks:

1. **FunctionThisSanitizer**: Prevents `this` binding to global
2. **PrototypeSanitizer**: Blocks `.constructor` and `.__proto__`
3. **DollarSignValidator**: Restricts `$` variable usage

### 8. Complete Expression Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INPUT (UI)                                          │
│    User types: ={{ $json.name }}                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. EXPRESSION EDITOR (CodeMirror)                           │
│    - Syntax highlighting                                    │
│    - Autocomplete                                           │
│    - Live preview                                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND RECEIVES: "={{ $json.name }}"                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. EXPRESSION.resolveSimpleParameterValue()                 │
│    a. Check if starts with '=' → YES                        │
│    b. Remove '=' → "$json.name"                             │
│    c. Create WorkflowDataProxy with context                 │
│       - Current item: { json: { name: "John" } }            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. INITIALIZE SECURITY                                      │
│    - Apply denylist (block: eval, fetch, etc.)              │
│    - Apply allowlist (allow: Date, Math, etc.)              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ADD EXTENSIONS                                           │
│    - extend() for method chaining                           │
│    - extendedFunctions (min, max, etc.)                     │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. TRANSFORM SYNTAX                                         │
│    extendSyntax("$json.name")                               │
│    → (no methods, stays same)                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. EVALUATE WITH TOURNAMENT                                 │
│    tournamentEvaluator.execute("$json.name", data)          │
│    → Accesses data.$json.name                               │
│    → Returns "John"                                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. RETURN RESULT                                            │
│    Parameter gets value: "John"                             │
└─────────────────────────────────────────────────────────────┘
```

### 9. Expression Examples

```javascript
// Simple JSON access
={{ $json.email }}

// Nested access
={{ $json.user.profile.name }}

// Access another node
={{ $node.PreviousNode.json.total }}

// Array methods (extended)
={{ $json.items.map(i => i.price) }}
={{ $json.items.filter(i => i.price > 100) }}

// String methods (extended)
={{ $json.name.toUpperCase() }}
={{ $json.description.substring(0, 50) }}

// Arithmetic
={{ $json.price * 1.1 }}
={{ $json.total + $json.tax }}

// Conditional
={{ $json.status === 'active' ? 'Yes' : 'No' }}

// Date manipulation
={{ $now.plus({days: 7}).toISO() }}
={{ $now.toFormat('yyyy-MM-dd') }}

// Combined operations
={{ $json.items.filter(i => i.active).map(i => i.name).join(', ') }}

// Mixed text and expressions
=Hello {{ $json.firstName }}, your total is ${{ $json.total }}

// Access specific item
={{ $item(0).json.name }}

// Get all items from node
={{ $items('HTTP Request').length }}

// JMESPath query
={{ $jmesPath($json, 'users[?age > `30`].name') }}
```

### 10. Key Files Reference

| File | Purpose |
|------|---------|
| `packages/workflow/src/expression.ts` | Main Expression class |
| `packages/workflow/src/expression-evaluator-proxy.ts` | Tournament evaluator |
| `packages/workflow/src/expression-sandboxing.ts` | Security (allowlist/denylist) |
| `packages/workflow/src/extensions/expression-extension.ts` | Method chaining extensions |
| `packages/workflow/src/extensions/expression-parser.ts` | `{{ }}` parser |
| `packages/workflow/src/workflow-data-proxy.ts` | Context variables ($json, $node) |
| `packages/frontend/editor-ui/src/features/ndv/parameters/components/ExpressionParameterInput.vue` | UI editor component |
| `packages/frontend/editor-ui/src/features/shared/editors/components/InlineExpressionEditor/InlineExpressionEditorInput.vue` | Inline CodeMirror editor |
| `packages/workflow/test/expression.test.ts` | Expression tests |
