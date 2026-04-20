<script>
    // Pixel-art renderer — strings+palette → SVG <rect>s with run-length merge.
    // `art`: array of equal-length strings. `palette`: { [char]: hexColor }. '.' / ' ' = transparent.
    let { art, palette, scale = 6, bg = null, width = null, height = null, pixelated = true, style = '' } = $props();

    let rows = $derived(art?.length ?? 0);
    let cols = $derived(art?.[0]?.length ?? 0);

    let rects = $derived.by(() => {
        if (!art || !palette) return [];
        const out = [];
        for (let r = 0; r < rows; r++) {
            let c = 0;
            const row = art[r];
            while (c < cols) {
                const ch = row[c];
                if (ch === '.' || ch === ' ') { c++; continue; }
                let run = 1;
                while (c + run < cols && row[c + run] === ch) run++;
                const color = palette[ch];
                if (color) out.push({ x: c, y: r, w: run, color });
                c += run;
            }
        }
        return out;
    });

    let w = $derived(width ?? cols * scale);
    let h = $derived(height ?? rows * scale);
</script>

<svg
    width={w}
    height={h}
    viewBox="0 0 {cols} {rows}"
    shape-rendering="crispEdges"
    style="display:block; image-rendering: {pixelated ? 'pixelated' : 'auto'}; {style}"
    preserveAspectRatio="none"
>
    {#if bg}<rect x="0" y="0" width={cols} height={rows} fill={bg} />{/if}
    {#each rects as r}
        <rect x={r.x} y={r.y} width={r.w} height="1" fill={r.color} />
    {/each}
</svg>
