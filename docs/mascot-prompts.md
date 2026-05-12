# TallyTails mascot system — fal.ai FLUX prompts

Generated via fal.ai with seed-locked consistency for the cat + dog mascot set. Goal: 8 reusable poses per character that compose into the popup variants + homepage face-off scenes.

## Style anchor (use as base prompt prefix for all)

```
Flat illustration style, modern brand mascot, clean vector look, slight grainy texture, warm muted lighting, off-white background, no shadows, no text, single character centered, full body, 1024x1024 square.
```

## Cat mascot personality

Smug, slim, mostly black with white chest blaze and gold eyes. Russian-blue / tuxedo hybrid look. Slightly arched eyebrows, knowing expression. Reads "judging you" without being unfriendly.

### Cat poses (8 total)

1. **idle-standing** — standing upright on hind legs, paws crossed, head slightly tilted, looking directly at viewer
2. **victory-throne** — sitting on a small wooden throne, one paw raised in salute, eyes half-closed in satisfaction
3. **sulking** — slumped, ears back, tail wrapped around paws, looking at the ground
4. **plotting** — leaning forward, eyes narrowed, devious half-smile
5. **dance** — mid-jump, paws in the air, mouth open in surprise/celebration
6. **side-eye** — head turned 3/4, looking sideways with skepticism
7. **stretched** — arched back, front paws extended forward, classic cat stretch
8. **shocked** — eyes wide, mouth small "o", paws on cheeks

## Dog mascot personality

Earnest, golden-retriever-coded, slightly chubby, floppy ears, big tongue, perpetual good mood. Light caramel/cream coat with darker ears and tail tip. Reads "your loyal best friend" energy.

### Dog poses (8 total)

1. **idle-standing** — standing on all four legs, head up, tongue out slightly, tail mid-wag
2. **victory-trophy** — sitting upright on hind legs with a small gold trophy between paws, beaming smile, tongue out
3. **sulking** — lying down, head on paws, big sad eyes looking up
4. **plotting** — head tilted to one side, one ear flopped, eyebrows raised in confusion (the "wait, what?" pose)
5. **dance** — front paws on ground, butt in the air, tail visibly wagging (zoomies posture)
6. **side-eye** — looking sideways with goofy concern
7. **stretched** — classic downward-dog stretch
8. **shocked** — eyes wide, mouth dropped open, ears straight up

## Composite scenes (use mascot poses + scene base prompt)

### scene-cats-dominating (use cat-victory-throne + dog-sulking)
```
Two character flat illustration: smug black cat with gold eyes sitting on a small wooden throne on the left, golden retriever dog lying on the ground on the right looking up sadly. Off-white background, no text, brand mascot style, 1024x768 horizontal.
```

### scene-dogs-dominating (use dog-victory-trophy + cat-plotting)
```
Two character flat illustration: golden retriever dog holding a small trophy on the right, beaming with tongue out. Black cat on the left, eyes narrowed, devious smile, plotting revenge. Off-white background, no text, brand mascot style, 1024x768 horizontal.
```

### scene-close-race (use cat-stretched + dog-stretched with tug-of-war)
```
Two character flat illustration: black cat on the left and golden retriever dog on the right pulling on opposite ends of a thick rope. Both leaning back with effort, rope perfectly horizontal in the middle. Off-white background, no text, brand mascot style, 1024x768 horizontal.
```

### scene-upset-cats-pulled-ahead (use cat-dance + dog-shocked)
```
Two character flat illustration: black cat on the left mid-jump in victory dance, paws in air. Golden retriever dog on the right with eyes wide and mouth dropped open in shock. Off-white background, no text, brand mascot style, 1024x768 horizontal.
```

### scene-upset-dogs-pulled-ahead (use dog-dance + cat-shocked)
```
Two character flat illustration: golden retriever dog on the right mid-zoomies (butt in air, tail wagging). Black cat on the left with eyes wide, paws on cheeks in shock. Off-white background, no text, brand mascot style, 1024x768 horizontal.
```

### scene-stalemate (use both mascots sharing popcorn)
```
Two character flat illustration: black cat and golden retriever dog sitting side by side facing forward, sharing a small bucket of popcorn between them. Both looking up at the viewer expectantly. Off-white background, no text, brand mascot style, 1024x768 horizontal.
```

## Wordmark

```
Flat illustration brand wordmark "TallyTails", lowercase tracking, friendly rounded serif typeface in warm cream color, optional small cat ear silhouette above the first T and small dog tail silhouette curling under the last s. Transparent background, 2048x512 horizontal, no other elements.
```

## Favicon (square crop)

```
Flat illustration brand mark, two small character heads in profile facing each other — smug black cat on the left, smiling golden retriever on the right, between them a small vertical line divider. Cream background, 512x512 square, modern minimalist.
```

## Generation pipeline (FLUX via fal.ai)

```bash
# Pseudo-code, will wire up after scaffold lands
FAL_KEY=38d7c0f6-7db8-4403-9b2f-9e9cb3c656c2:8b0f0ac6b846f6c467cd411b525d5b71

# Generate cat base
fal-run flux-pro-1.1 --prompt "$STYLE_ANCHOR + $CAT_IDLE_PROMPT" --seed 42 --output cat-idle.png

# Lock cat seed for consistency across all 8 poses
for pose in idle victory sulking plotting dance side-eye stretched shocked; do
  fal-run flux-pro-1.1 --prompt "..." --seed 42 --image_prompt cat-idle.png --strength 0.5 --output cat-$pose.png
done

# Same drill for dog with seed 84
# Then composite scenes from individual mascot crops

# Total est cost: ~$0.20 per image * 24 images (16 mascots + 6 scenes + wordmark + favicon) = ~$5
# With iteration/retries probably $20-40 total
```

## Final output paths in repo

```
/public/brand/
  ├── logo-wordmark.svg
  ├── logo-wordmark.png  (2048x512)
  ├── favicon.png  (512x512)
  ├── favicon.ico
  ├── mascots/
  │   ├── cat-idle.webp
  │   ├── cat-victory-throne.webp
  │   ├── cat-sulking.webp
  │   ├── cat-plotting.webp
  │   ├── cat-dance.webp
  │   ├── cat-side-eye.webp
  │   ├── cat-stretched.webp
  │   ├── cat-shocked.webp
  │   ├── dog-idle.webp
  │   ├── dog-victory-trophy.webp
  │   ├── dog-sulking.webp
  │   ├── dog-plotting.webp
  │   ├── dog-dance.webp
  │   ├── dog-side-eye.webp
  │   ├── dog-stretched.webp
  │   └── dog-shocked.webp
  └── scenes/
      ├── scene-cats-dominating.webp
      ├── scene-dogs-dominating.webp
      ├── scene-close-race.webp
      ├── scene-upset-cats.webp
      ├── scene-upset-dogs.webp
      └── scene-stalemate.webp
```
