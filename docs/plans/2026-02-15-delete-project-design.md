# Delete Project from Projects Screen

## Summary

Allow project owners to delete projects from the projects list screen via a trash icon with a typed confirmation modal.

## Context

- Backend `DELETE /api/projects/:id` already exists (owner-only, cascade deletes all related data)
- Projects list API returns `createdBy` field for ownership checks
- `useAuth()` provides current `user.id`
- Icon system uses `lucide-react-native` via `<Icon>` component

## Design

### Hook: `useDeleteProject()`

Add to `apps/mobile/hooks/use-projects.ts`. Follows existing mutation pattern — calls `DELETE /api/projects/:id`, invalidates `["projects"]` query on success.

### UI: Trash icon on project cards

In the projects list (`apps/mobile/app/(app)/(tabs)/index.tsx`), render a `Trash2` icon on the right side of each project card where `item.createdBy === user.id`. Tapping the icon opens the confirmation modal.

### Confirmation modal: `DeleteProjectModal`

New component `apps/mobile/components/DeleteProjectModal.tsx`:
- React Native `Modal` (not `Alert.prompt` — iOS-only, doesn't work on web/Android)
- Shows project name and warning text
- `TextInput` where user must type "DELETE"
- Submit button disabled until input matches "DELETE" exactly
- Calls `useDeleteProject()` mutation on submit
- Closes and clears input on cancel or successful deletion

### Data flow

1. User taps trash icon on owned project card
2. Modal opens with project context
3. User types "DELETE" in text input
4. Submit button enables, user taps it
5. `DELETE /api/projects/:id` fires
6. On success: modal closes, `["projects"]` query invalidates, list refreshes
7. On error: show error message in modal
