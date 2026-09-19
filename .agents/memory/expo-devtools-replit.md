---
name: Expo DevTools no Replit
description: Como interpretar o aviso de biblioteca gráfica ausente do React Native DevTools no workflow Expo.
---

No Expo SDK 57, o workflow pode registrar que o executável do React Native DevTools não encontrou `libglib-2.0.so.0`. Esse aviso não significa, sozinho, que o Metro ou o Expo Go falharam.

**Why:** O DevTools gráfico é iniciado separadamente do Metro. Neste ambiente, os bundles web e Android, o servidor Metro e o preview continuaram funcionando apesar do aviso.

**How to apply:** Antes de tratar o aviso como falha do aplicativo, confirme o estado do workflow, gere um bundle e abra o preview. Só investigue a biblioteca do DevTools se o usuário precisar especificamente dessa interface gráfica.