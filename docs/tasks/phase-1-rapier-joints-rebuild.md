# Phase 1: Rebuild Card with Physics Joints

## Tasks

- [ ] Add a physics world to the scene with a single falling cube to verify physics works
- [ ] Replace the cube with the right page as a fixed (immovable) body
- [ ] Add the left page as a free body connected to the right page at the spine with a hinge joint — it should swing freely under gravity
- [ ] Disable gravity so the pages stay level, and drive the spine hinge with a motor controlled by the opening-angle slider (0°–180°)
- [ ] Add one V-fold arm on the right page, attached at the spine with a hinge joint — it should dangle freely when the card opens
- [ ] Add the second V-fold arm on the left page, also attached with a hinge joint
- [ ] Connect the tips of both V-fold arms with a joint so they fold together as the card opens and closes

## Notes



## QA



## Resources

- [react-three-rapier](https://github.com/pmndrs/react-three-rapier)
- [Rapier revolute joints](https://rapier.rs/docs/user_guides/javascript/joints)
