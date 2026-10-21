<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Wardrobe items, wear history and settings live in the shared localStorage-backed store in src/lib/store.ts; pages read/write through useStore() so every page stays in sync.
- Keep location, device profile, outfit favorites and saved plans in the same shared store to preserve the requested device-based workflow.
- Share location-keyed weather queries across pages; never substitute sample weather when live forecasts fail, because recommendations must reflect the selected place.
- Run optional photo analysis through a server function and server-only AI helpers; ask users to confirm fabric because photos cannot reliably establish fiber composition.
- Keep detailed choosing and future planning in the planner; the dashboard also supports quick daily wear logging, and insights derive only from recorded wardrobe data.
- Derive dashboard outfit priority and wear highlights through src/lib/dashboard.ts; unavailable clothes are excluded from suggestions, and undated inventory must not imply age.
- Track optional item price, addition time and care status in the existing device store; missing values remain unknown instead of being seeded.
- The shared Header owns the collapsible sidebar and top bar; all content pages reserve sidebar space using the global page-shell layout.
- Daily energy moods live in the shared device store and bias dashboard color ranking without replacing saved or recorded outfits or prioritizing rain-risky clothes over rain-safe choices.
- Resolve geolocation names through the browser-safe location helper; preserve actual coordinates and show them when city lookup fails rather than inventing a place.
