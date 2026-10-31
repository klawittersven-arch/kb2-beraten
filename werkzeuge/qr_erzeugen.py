"""QR-Codes für die drei Smartphone-Übungen erzeugen und prüfen.

Aufruf (im Hauptverzeichnis des Repositorys):
    pip install segno zxing-cpp pillow
    python werkzeuge/qr_erzeugen.py

- Liest Besitzer und Namen des Repositorys aus dem Git-Remote „origin“
  (ohne Remote: klawittersven-arch/kb2-beraten).
- Erzeugt qr/qr_bremsen.png, qr/qr_phasen.png und qr/qr_angehoerige.png (Fehlerkorrektur M,
  Ruhezone 4 Module, mindestens 600 × 600 px) und prüft, dass sie sich
  dekodieren lassen.
"""
import re
import subprocess
import sys
from pathlib import Path

import segno

WURZEL = Path(__file__).resolve().parent.parent
QR_ORDNER = WURZEL / "qr"
SEITEN = ["bremsen", "phasen", "angehoerige"]


def repo_aus_remote():
    try:
        url = subprocess.check_output(["git", "-C", str(WURZEL), "remote", "get-url", "origin"],
                                      text=True, stderr=subprocess.DEVNULL).strip()
    except subprocess.CalledProcessError:
        return "klawittersven-arch", "kb2-beraten"
    m = re.search(r"github\.com[/:]([^/]+)/([^/]+?)(?:\.git)?/?$", url)
    return (m.group(1), m.group(2)) if m else ("klawittersven-arch", "kb2-beraten")


def adressen():
    besitzer, repo = repo_aus_remote()
    basis = f"https://{besitzer.lower()}.github.io/{repo}"
    return {s: f"{basis}/{s}.html" for s in SEITEN}


def qr_erzeugen(adresse, datei):
    qr = segno.make(adresse, error="m", micro=False)
    breite_module = qr.symbol_size(scale=1, border=4)[0]
    massstab = -(-600 // breite_module)  # aufrunden, damit mindestens 600 px
    qr.save(str(datei), kind="png", scale=massstab, border=4, dark="#000000", light="#FFFFFF")


def qr_pruefen(datei, erwartet):
    try:
        import zxingcpp
        from PIL import Image
    except ImportError:
        print("  (zxing-cpp/Pillow nicht installiert – Dekodierprüfung übersprungen)")
        return
    bild = Image.open(datei)
    ergebnisse = zxingcpp.read_barcodes(bild)
    texte = [e.text for e in ergebnisse]
    if texte != [erwartet]:
        sys.exit(f"QR-Prüfung fehlgeschlagen für {datei}: {texte}")
    print(f"  {datei.name}: {texte[0]}  ({bild.size[0]} × {bild.size[1]} px, Fehlerkorrektur {ergebnisse[0].ec_level})")


def main():
    QR_ORDNER.mkdir(exist_ok=True)
    for seite, adresse in adressen().items():
        datei = QR_ORDNER / f"qr_{seite}.png"
        qr_erzeugen(adresse, datei)
        qr_pruefen(datei, adresse)


if __name__ == "__main__":
    main()
