# Concerns

## Observed Issues

- Navigation is partially non-functional. `central-pet-front/src/Components/DropdownMenu.tsx` renders every menu item as `<a href="#">`, so the header menus do not route anywhere. `central-pet-front/src/routes.tsx` also declares `'/login'` but there is no matching route element, while `central-pet-front/src/Layout/Header.tsx` still links to it.
- The app persists core product state in browser storage only. `central-pet-front/src/Mocks/PetsStorage.ts` reads, writes, and normalizes pets and profiles from `window.localStorage`, and `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx` also writes draft form state there during normal editing. There is no server-backed source of truth in this repo.
- User-uploaded photos are converted to data URLs and saved in storage. `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx` uses `FileReader.readAsDataURL`, which can grow `localStorage` quickly and makes the data model sensitive to browser quota limits.
- The carousel intentionally duplicates the pets array and depends on index-based keys. `central-pet-front/src/Components/Carousel.tsx` comments that it duplicates data to fake infinite scroll and acknowledges key-duplication/continuity issues. That approach is fragile if the list becomes larger or interactive.
- Several profile fields are reconstructed from encoded strings instead of structured data. `central-pet-front/src/Mocks/PetsStorage.ts` derives `physicalCharacteristics` by splitting a comma-delimited string, and `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx` rebuilds profile cards from that shape. This makes the display logic sensitive to formatting drift.

## Inferred Risks

- Because persistence is client-only, clearing site data, changing devices, or opening the app in a new browser loses records. That is an expected limitation of `central-pet-front/src/Mocks/PetsStorage.ts`, but it is a product risk if the UI is treated as real adoption data rather than demo data.
- The remote image URLs in `central-pet-front/src/Mocks/Pet.tsx` depend on third-party availability and can leak user/page requests to the host. If those assets are blocked or slow, the homepage carousel and profile cards degrade immediately.
- Synchronous `localStorage` reads happen during render in `central-pet-front/src/App.tsx`, `central-pet-front/src/Pages/MainPage.tsx`, and `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`. That is fine for a tiny mock dataset, but it will become a responsiveness bottleneck as stored data grows.
- The codebase mixes real UI with mock-only domain state, which will slow future backend integration. Multiple components contain `TODO` notes that state "should come from back" in `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`, `central-pet-front/src/Components/PetRegister/PetRegisterHealthSection.tsx`, and `central-pet-front/src/Components/PetProfile/PetProfileOverview.tsx`.

## Quality Gaps

- Documentation is ahead of implementation in a few places. `README.md` says the frontend uses Zustand and React Hook Form, but `central-pet-front/package.json` and `central-pet-front/src/` do not show those dependencies or patterns.
- Test coverage is thin around the riskiest flows. The current tests in `central-pet-front/src/Components/Carousel.test.tsx`, `central-pet-front/src/Components/PetModal.test.tsx`, `central-pet-front/src/Components/SidePanel.test.tsx`, and `central-pet-front/tests/e2e/home.spec.ts` mostly verify rendering, not save/load, edit, storage recovery, or malformed data handling.
- There is no visible CI workflow for build/lint/test validation. Under `.github/workflows/`, only `issue_updater.yml` is present, so regressions are likely to rely on local execution rather than automated gatekeeping.
