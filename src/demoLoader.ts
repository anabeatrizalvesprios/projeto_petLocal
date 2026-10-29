// Carrega os dados de demonstração (conta de teste e anúncios fictícios) só quando necessário.


export const ensureDemoData = async () =>
  (await import("./demoData")).ensureDemoData()
