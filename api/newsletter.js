import { dohvatiEvandjelje } from "./evandjelje.js";

const CRVENA = "#c1121f";
const SIVA = "#6b6a65";

export function sastaviHtml(p) {
  const odlomci = p.retci
    .map((r) => {
      if (r.startsWith("Čitanje") || r === "Riječ Gospodnja.") {
        return `<p style="text-align:center;color:${r === "Riječ Gospodnja." ? SIVA : "#2c2c2a"};margin:0 0 14px;">${r}</p>`;
      }
      return `<p style="text-align:justify;margin:0 0 14px;">${r}</p>`;
    })
    .join("\n");

  return `
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.8;color:#2c2c2a;">
    <p style="text-align:center;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${CRVENA};margin:0 0 6px;">${p.datum || ""}</p>
    <h1 style="text-align:center;font-size:26px;font-weight:normal;margin:0 0 8px;">Evanđelje: ${p.referenca}</h1>
    ${p.izreka ? `<p style="text-align:center;font-style:italic;color:${SIVA};margin:0 0 22px;">„${p.izreka}”</p>` : ""}
    <div style="width:52px;height:2px;background:${CRVENA};margin:0 auto 22px;"></div>
    ${odlomci}
    <div style="border-top:1px solid #e6e3dc;margin-top:28px;padding-top:16px;text-align:center;font-family:Arial,sans-serif;font-size:13px;color:${SIVA};">
      <p style="margin:0 0 8px;">Više o liturgiji dana:</p>
      <p style="margin:0;">
        <a href="https://hilp.hr/liturgija-dana/" style="color:${CRVENA};">hilp.hr</a> ·
        <a href="https://hallow.com/collections/287/" style="color:${CRVENA};">Hallow</a> ·
        <a href="https://hkr.hkm.hr/kategorije/u-svjetlu-bozje-rijeci/" style="color:${CRVENA};">HKR</a> ·
        <a href="https://evandelje-dana.vercel.app" style="color:${CRVENA};">Web stranica</a>
      </p>
    </div>
  </div>`;
}

export default async function handler(req, res) {
  const tajna = process.env.CRON_SECRET;
  if (tajna && req.headers.authorization !== `Bearer ${tajna}`) {
    return res.status(401).json({ greska: "Neovlašteno" });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ greska: "RESEND_API_KEY nije postavljen u Vercel postavkama" });
  }

  try {
    const podaci = await dohvatiEvandjelje();
    const primatelj = process.env.NEWSLETTER_EMAIL || "jomajer@gmail.com";

    const slanje = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Evanđelje dana <onboarding@resend.dev>",
        to: [primatelj],
        subject: `Evanđelje: ${podaci.referenca} — ${podaci.datum || ""}`.trim(),
        html: sastaviHtml(podaci),
      }),
    });

    if (!slanje.ok) {
      throw new Error(`Resend je vratio ${slanje.status}: ${await slanje.text()}`);
    }
    res.status(200).json({ poslano: true, primatelj, referenca: podaci.referenca });
  } catch (gr) {
    res.status(502).json({ greska: gr.message });
  }
}
