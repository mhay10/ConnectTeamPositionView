import matplotlib.colors as mcolors
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import sys

# Get command line args
if len(sys.argv) != 2:
    print("Usage: python position_view.py <file>")
    sys.exit(1)

# Read the df from the CSV file
df = pd.read_csv(
    sys.argv[1],
    header=None,
    names=["Position", "Name", "Start", "End"],
)


# Create color for each position
def get_lexographic_value(s: str):
    s = s.lower()

    total = 0
    for i, c in enumerate(s):
        value = ord(c) - ord("A") + 1
        total += value * (26 ** (len(s) - i - 1))

    return total


def get_color(val: int):
    val_range = (0, np.iinfo(np.uint8).max)
    rgb_range = (0, 255)

    r = int(np.interp(val % 256, val_range, rgb_range))
    g = int(np.interp((val // 256) % 256, val_range, rgb_range))
    b = int(np.interp((val // (256**2)) % 256, val_range, rgb_range))

    return (r / 255, g / 255, b / 255)


position_colors = {
    pos: get_color(get_lexographic_value(pos)) for pos in df.Position.values
}

# Create a figure and an axis object
fig, ax = plt.subplots(figsize=(15, 8))

# Set grid formatting
ax.grid(which="major", axis="x", linestyle="solid", alpha=0.25, color="gainsboro")
ax.grid(
    which="minor", axis="x", linestyle=":", linewidth=0.5, alpha=0.5, color="gainsboro"
)
ax.tick_params(axis="x")

ax.grid(which="major", axis="y", linestyle="--", alpha=0.25, color="gainsboro")

# Loop through the rows of the df and plot a horizontal bar for each row
for i, row in df.iterrows():
    shifts = df[df.Position == row.Position]
    start = pd.to_datetime(row["Start"])
    end = pd.to_datetime(row["End"])
    duration = end - start

    bar = ax.broken_barh(
        [(start.hour + start.minute / 60, duration.total_seconds() / 3600)],
        (i - 0.25, 0.5),
        facecolors=position_colors[row.Position] + (0.25,),
        edgecolors=position_colors[row.Position] + (0.5,),
    )
    ax.text(
        (start.hour + start.minute / 60) + duration.total_seconds() / 7200,
        i + 0.075,
        row["Name"],
        fontsize=8,
        weight="bold",
        ha="center",
        va="center",
        color="black",
    )

# Set the y-ticks and labels to the positions
ax.set_yticks(range(len(df)))
ax.set_yticklabels(df["Position"])

# Set the major x-ticks every 30 mins
xticks = np.arange(7.5, 22.5, 0.5)
ax.set_xticks(xticks)
xlabels = [
    f"{int(t) % 12 if int(t) != 12 else 12}:{'00' if t.is_integer() else '30'} {'AM' if t < 12 else 'PM'}"
    for t in xticks
]
ax.set_xticklabels(xlabels)
ax.set_xlim(xticks[0], xticks[-1])
plt.xticks(rotation=45, ha="right")

# Set the minor x-ticks every 15 mins
minor_xticks = np.arange(7.75, 22.5, 0.5)
ax.set_xticks(minor_xticks, minor=True)

# Set the title and axis labels
ax.set_title("Position View")

# Invert y-axis
ax.invert_yaxis()

# Show the plot
plt.show()
