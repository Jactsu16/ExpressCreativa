from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BACKGROUND = ROOT / "img" / "social" / "social-background.png"
LOGO = ROOT / "favicon.ico"
OUTPUT = ROOT / "img" / "social"
WIDTH, HEIGHT = 1200, 630


def prepare_background():
    image = Image.open(BACKGROUND).convert("RGB")
    ratio = max(WIDTH / image.width, HEIGHT / image.height)
    image = image.resize(
        (round(image.width * ratio), round(image.height * ratio)),
        Image.Resampling.LANCZOS,
    )
    left = (image.width - WIDTH) // 2
    top = (image.height - HEIGHT) // 2
    image = image.crop((left, top, left + WIDTH, top + HEIGHT)).convert("RGBA")

    shade = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    for x in range(WIDTH):
        alpha = max(0, min(205, round(205 * (1 - x / 900))))
        shade_draw.line((x, 0, x, HEIGHT), fill=(0, 8, 35, alpha))
    return Image.alpha_composite(image, shade)


def generate_card(background, filename, title, subtitle):
    canvas = background.copy()
    draw = ImageDraw.Draw(canvas)
    bold = "C:/Windows/Fonts/segoeuib.ttf"
    regular = "C:/Windows/Fonts/segoeui.ttf"

    logo = Image.open(LOGO).convert("RGB").resize((108, 108), Image.Resampling.LANCZOS)
    mask = Image.new("L", (108, 108), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 107, 107), radius=24, fill=255)
    canvas.paste(logo, (76, 72), mask)

    draw.text(
        (76, 205),
        "EXPRESS CREATIVA",
        font=ImageFont.truetype(bold, 27),
        fill=(92, 216, 255, 255),
    )
    draw.text(
        (76, 252),
        title,
        font=ImageFont.truetype(bold, 55 if len(title) < 35 else 48),
        fill=(255, 255, 255, 255),
    )
    draw.rounded_rectangle((76, 338, 150, 346), radius=4, fill=(255, 181, 48, 255))
    draw.text(
        (76, 380),
        subtitle,
        font=ImageFont.truetype(regular, 25),
        fill=(220, 233, 249, 255),
    )
    draw.text(
        (76, 540),
        "Desde Panam\u00e1 para la regi\u00f3n",
        font=ImageFont.truetype(regular, 21),
        fill=(166, 204, 239, 255),
    )
    canvas.convert("RGB").save(OUTPUT / filename, "PNG", optimize=True)


def main():
    background = prepare_background()
    cards = {
        "express-creativa-og.png": (
            "Creative Communications Agency",
            "Estrategia \u00b7 Dise\u00f1o \u00b7 Producci\u00f3n \u00b7 Tecnolog\u00eda",
        ),
        "servicios-og.png": (
            "Servicios creativos integrales",
            "Digital \u00b7 Branding \u00b7 Studio \u00b7 Print \u00b7 Media \u00b7 Events",
        ),
        "calculadora-og.png": (
            "Calculadora de m\u00e9tricas publicitarias",
            "CPM \u00b7 CPC \u00b7 CTR \u00b7 CPA \u00b7 ROI \u00b7 Conversi\u00f3n",
        ),
        "cotizacion-og.png": (
            "Cu\u00e9ntanos tu proyecto",
            "Prepara una solicitud de cotizaci\u00f3n sin pagos en l\u00ednea",
        ),
    }
    for filename, (title, subtitle) in cards.items():
        generate_card(background, filename, title, subtitle)


if __name__ == "__main__":
    main()
