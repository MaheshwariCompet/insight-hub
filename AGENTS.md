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
- Keep choosing, future planning and wear logging in the planner; the overview links to it and insights derive only from recorded wardrobe data.
