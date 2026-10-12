"""Draw the PWA icons. Run from the repo root: python3 make-icons.py"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle

BG = "#fbfaf7"
INK = "#1f2320"
ACCENT = "#d1495b"


def draw(path, size, rounded=True, pad=0.0):
    dpi = 100
    fig = plt.figure(figsize=(size / dpi, size / dpi), dpi=dpi)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    if rounded:
        ax.add_patch(FancyBboxPatch(
            (0.03, 0.03), 0.94, 0.94,
            boxstyle="round,pad=0,rounding_size=0.18",
            linewidth=0, facecolor=BG))
    else:
        ax.add_patch(Rectangle((0, 0), 1, 1, linewidth=0, facecolor=BG))
    scale = 1.0 - pad
    ax.text(0.46, 0.47, "lah", ha="center", va="center",
            fontsize=size * 0.30 * scale, fontweight="bold", color=INK)
    # the full stop is a drawn circle, not a glyph, so its position does not
    # depend on whichever font the machine happens to have
    ax.add_patch(plt.Circle((0.80, 0.36), 0.045 * scale,
                            linewidth=0, facecolor=ACCENT))
    fig.savefig(path, dpi=dpi, transparent=True)
    plt.close(fig)


draw("icons/icon-512.png", 512)
draw("icons/icon-192.png", 192)
# maskable: no rounded corners and extra margin, because the platform crops it
draw("icons/icon-512-maskable.png", 512, rounded=False, pad=0.25)
print("icons written")
