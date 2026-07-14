const IZVOR = "https://hilp.hr/liturgija-dana/";

export function parseHilp(html) {
  const datum = matchFirst(
    html,
    /<h4 class="et_pb_module_header"><span>((?:Ponedjeljak|Utorak|Srijeda|Četvrtak|Petak|Subota|Nedjelja)[^<]*)<\/span><\/h4>/
  );

  const refPos = html.indexOf("<span>Evanđelje:</span>");
  if (refPos === -1) throw new Error("Na stranici nije pronađen blok 'Evanđelje:'");

  const nakonNaslova = html.slice(refPos);
  const refMatch = nakonNaslova.match(/<div class="et_pb_blurb_description">([^<]+)<\/div>/);
  if (!refMatch) throw new Error("Nije pronađena referenca evanđelja (npr. Mt 11,20-24)");
  const referenca = refMatch[1].trim();

  const ostatak = nakonNaslova.slice(refMatch.index + refMatch[0].length);
  const izreka = matchFirst(ostatak, /<h4 class="et_pb_module_header"><span>([\s\S]*?)<\/span><\/h4>/);
  const tekstHtml = matchFirst(ostatak, /<div class="et_pb_blurb_description">([\s\S]*?)<\/div>/);
  if (!tekstHtml) throw new Error("Nije pronađen tekst evanđelja");

  const retci = tekstHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((r) => r.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return { datum, referenca, izreka, retci, izvor: IZVOR };
}

function matchFirst(text, re) {
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

export async function dohvatiEvandjelje() {
  const odgovor = await fetch(IZVOR, {
    headers: { "User-Agent": "Mozilla/5.0 (EvandjeljeDana; osobna upotreba)" },
  });
  if (!odgovor.ok) throw new Error(`hilp.hr je vratio status ${odgovor.status}`);
  return parseHilp(await odgovor.text());
}

export default async function handler(req, res) {
  try {
    const podaci = await dohvatiEvandjelje();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=900, s-maxage=1800");
    res.status(200).json(podaci);
  } catch (gr) {
    res.status(502).json({ greska: gr.message });
  }
}
