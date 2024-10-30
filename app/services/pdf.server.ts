import type { Template } from "@prisma/client";
import puppeteer from "puppeteer";

export async function convertTinyMceHtmlToPdf(template: Template) {
  // Lanzar el navegador headless
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Inyectar el HTML de TinyMCE en la página
  await page.setContent(
    `<style>body { font-family: Arial, sans-serif; }</style>` +
      template.header +
      template.body!,
    {
      waitUntil: "networkidle0",
    }
  );

  // Ajustar las opciones de impresión para el PDF
  const pdfBuffer = await page.pdf({
    footerTemplate: `<div style="display:block; width: 100%; position: fixed; bottom: 0; left: 0;">${
      template.footer ?? ""
    }</div>`,
    headerTemplate: "_",
    displayHeaderFooter: true,
    format: "A4", // O el tamaño de página que prefieras
    printBackground: true, // Incluir los fondos de los estilos CSS
    margin: { top: "10mm", bottom: "10mm", left: "18mm", right: "10mm" }, // Márgenes opcionales
  });

  await browser.close();
  return pdfBuffer;
}
