# Flash Lanches – Delivery

Site de delivery para lanchonete, feito com HTML5, CSS3 e JavaScript puro (sem dependências).

## Funcionalidades
- Catálogo por categorias (Lanches, Acompanhamentos, Bebidas)
- Carrinho lateral com subtotal, taxa de entrega e total em tempo real
- Pagamento adiantado obrigatório (PIX ou cartão de crédito). Não há pagamento na entrega
- Dados de entrega, número do pedido, previsão e resumo via WhatsApp
- Layout responsivo, focado em celular, com modo escuro automático

## Como rodar
Abra o `index.html` no navegador. Não precisa de build nem de servidor.

## Configuração
No início do `script.js`, edite o objeto `CONFIG`:
- `whatsapp`: número da lanchonete (DDI + DDD + número, só dígitos)
- `pixKey`, `pixName`, `pixCity`: chave Pix do PicPay e dados do recebedor (o código e o QR Code são gerados com o valor do pedido)
- `fee` e `freeFrom`: taxa de entrega e valor para frete grátis

## Como o pagamento funciona (sem CNPJ)
- **PIX:** o cliente paga o código com o valor exato direto na sua conta PicPay e envia o comprovante no WhatsApp.
- **Cartão de crédito:** o pedido chega no WhatsApp e você responde com um link de pagamento PicPay Negócios no valor total.
- O preparo só começa depois que você confirmar o pagamento no app do PicPay. A confirmação é manual.
- Com CNPJ/MEI, dá para trocar por integração via API do PicPay Empresas, com confirmação automática.
