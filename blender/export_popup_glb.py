# ─────────────────────────────────────────────────────────────────────
# Pop-up Simulator – Export Helper Panel
# ─────────────────────────────────────────────────────────────────────
# Adds a "Pop-up Export" panel to the 3D Viewport sidebar (N-panel)
# with:
#   • Include by type – checkboxes per object type in the scene,
#     with live counts. "Select Included" picks matching objects.
#   • Live summary of the current selection
#   • "Save Physics Props" button – copies rigid-body / constraint
#     data to custom properties so they survive glTF export
#
# After clicking the button, use the normal File → Export → glTF
# to keep all the standard export settings.
#
# Install: Edit → Preferences → Add-ons → Install… → select this file
# Or run once in Blender's Text Editor.
# ─────────────────────────────────────────────────────────────────────

bl_info = {
    "name": "Pop-up Export Helper",
    "description": "Sidebar panel to prepare pop-up models for glTF export",
    "author": "popup-simulator",
    "version": (1, 3, 0),
    "blender": (4, 0, 0),
    "category": "Import-Export",
}

import bpy
from bpy.props import BoolProperty, PointerProperty
from bpy_extras.io_utils import ExportHelper
from collections import Counter

# Icons for each Blender object type
TYPE_ICONS = {
    'MESH': 'OUTLINER_OB_MESH',
    'EMPTY': 'OUTLINER_OB_EMPTY',
    'CAMERA': 'OUTLINER_OB_CAMERA',
    'LIGHT': 'OUTLINER_OB_LIGHT',
    'CURVE': 'OUTLINER_OB_CURVE',
    'ARMATURE': 'OUTLINER_OB_ARMATURE',
    'FONT': 'OUTLINER_OB_FONT',
    'SURFACE': 'OUTLINER_OB_SURFACE',
    'LATTICE': 'OUTLINER_OB_LATTICE',
    'SPEAKER': 'OUTLINER_OB_SPEAKER',
}


# ── PropertyGroup: one bool per object type ─────────────────────────
# We pre-define all common types. The panel only shows
# the ones that actually exist in the current scene.

class POPUP_PG_type_filter(bpy.types.PropertyGroup):
    mesh: BoolProperty(name="Mesh", default=True)
    empty: BoolProperty(name="Empty", default=True)
    camera: BoolProperty(name="Camera", default=False)
    light: BoolProperty(name="Light", default=False)
    curve: BoolProperty(name="Curve", default=True)
    armature: BoolProperty(name="Armature", default=True)
    font: BoolProperty(name="Font", default=True)
    surface: BoolProperty(name="Surface", default=True)
    lattice: BoolProperty(name="Lattice", default=False)
    speaker: BoolProperty(name="Speaker", default=False)

    def is_type_included(self, blender_type):
        """Check if a Blender object type string is enabled."""
        prop_name = blender_type.lower()
        return getattr(self, prop_name, False)


# ── PropertyGroup: glTF export settings ─────────────────────────────
# Mirrors a subset of the built-in glTF exporter params so they're
# visible in the panel. Defaults match the pop-up project needs
# (not necessarily the Blender defaults).

class POPUP_PG_export_settings(bpy.types.PropertyGroup):
    # Transform
    export_yup: BoolProperty(
        name="+Y Up",
        description="Export using glTF convention, +Y up",
        default=True,
    )
    # Scene Graph
    export_hierarchy_flatten_objs: BoolProperty(
        name="Flatten Object Hierarchy",
        description="Flatten object hierarchy (useful for non-decomposable transforms)",
        default=True,
    )
    # Mesh
    export_apply: BoolProperty(
        name="Apply Modifiers",
        description="Apply modifiers to mesh objects (prevents shape key export)",
        default=True,
    )
    export_texcoords: BoolProperty(
        name="UVs",
        description="Export UVs (texture coordinates) with meshes",
        default=True,
    )
    export_normals: BoolProperty(
        name="Normals",
        description="Export vertex normals with meshes",
        default=True,
    )


# ── Operator: select objects matching the type filter ───────────────

class POPUP_OT_select_by_type(bpy.types.Operator):
    """Select all objects whose type is checked in the filter above"""

    bl_idname = "popup.select_by_type"
    bl_label = "Select Included Types"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        type_filter = context.scene.popup_type_filter
        count = 0
        bpy.ops.object.select_all(action='DESELECT')
        for obj in context.scene.objects:
            if type_filter.is_type_included(obj.type):
                obj.select_set(True)
                count += 1
        self.report({'INFO'}, f"Selected {count} object(s)")
        return {'FINISHED'}


# ── Operator: copy physics → custom props ───────────────────────────

class POPUP_OT_save_physics_props(bpy.types.Operator):
    """Copy rigid-body and constraint settings into custom properties.
    glTF doesn't export Blender's physics data natively, so we mirror
    them into custom props that the Three.js loader can read."""

    bl_idname = "popup.save_physics_props"
    bl_label = "Save Physics Props"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        count = 0
        for obj in bpy.data.objects:
            if obj.rigid_body:
                rb = obj.rigid_body
                obj["rb_type"] = rb.type            # 'ACTIVE' or 'PASSIVE'
                obj["rb_animated"] = rb.kinematic    # the "Animated" checkbox
                obj["rb_dynamic"] = rb.enabled       # the "Dynamic" checkbox
                count += 1

            if obj.rigid_body_constraint:
                rbc = obj.rigid_body_constraint
                obj["rbc_type"] = rbc.type           # 'HINGE', 'FIXED', etc.
                if rbc.object1:
                    obj["rbc_object1"] = rbc.object1.name
                if rbc.object2:
                    obj["rbc_object2"] = rbc.object2.name
                count += 1

        self.report({'INFO'}, f"Saved physics props for {count} object(s)")
        return {'FINISHED'}


# ── Operator: one-click export ──────────────────────────────────────
# Chains: save physics props → select by type filter → export GLB.
# Uses ExportHelper to open a file browser.

class POPUP_OT_export_glb(bpy.types.Operator, ExportHelper):
    """Save physics props, select included types, and export as .glb"""

    bl_idname = "popup.export_glb"
    bl_label = "Export Pop-up GLB"
    bl_options = {'PRESET'}

    filename_ext = ".glb"

    def execute(self, context):
        type_filter = context.scene.popup_type_filter
        settings = context.scene.popup_export_settings

        # 1. Copy physics → custom props
        copy_physics_to_custom_props(bpy.data.objects)

        # 2. Select objects matching the type filter
        bpy.ops.object.select_all(action='DESELECT')
        count = 0
        for obj in context.scene.objects:
            if type_filter.is_type_included(obj.type):
                obj.select_set(True)
                count += 1

        # 3. Export with the panel settings
        bpy.ops.export_scene.gltf(
            filepath=self.filepath,
            export_format='GLB',
            use_selection=True,
            export_extras=True,
            export_yup=settings.export_yup,
            export_hierarchy_flatten_objs=settings.export_hierarchy_flatten_objs,
            export_apply=settings.export_apply,
            export_texcoords=settings.export_texcoords,
            export_normals=settings.export_normals,
        )

        self.report({'INFO'}, f"Exported {count} object(s) → {self.filepath}")
        return {'FINISHED'}


# ── Panel: sidebar in 3D Viewport (N-panel) ────────────────────────

class VIEW3D_PT_popup_export(bpy.types.Panel):
    """Pop-up Export helper panel, visible in the N-panel sidebar."""

    bl_label = "Pop-up Export"
    bl_idname = "VIEW3D_PT_popup_export"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Pop-up"           # Tab name in the N-panel

    def draw(self, context):
        layout = self.layout
        type_filter = context.scene.popup_type_filter

        # ── Include by type ─────────────────────────────────────────
        # Only shows types that exist in the scene, with live counts.
        box = layout.box()
        box.label(text="Include by Type", icon='FILTER')

        scene_counts = Counter(obj.type for obj in context.scene.objects)
        for obj_type, count in sorted(scene_counts.items()):
            prop_name = obj_type.lower()
            if not hasattr(type_filter, prop_name):
                continue
            icon = TYPE_ICONS.get(obj_type, 'OBJECT_DATA')
            row = box.row()
            row.prop(type_filter, prop_name, text=f"{obj_type} ({count})", icon=icon)

        # "Select Included" applies the filter to the scene selection
        row = box.row()
        row.operator(POPUP_OT_select_by_type.bl_idname, icon='RESTRICT_SELECT_OFF')

        layout.separator()

        # ── Selection summary ───────────────────────────────────────
        box = layout.box()
        box.label(text="Current Selection", icon='RESTRICT_SELECT_OFF')

        selected = context.selected_objects
        if selected:
            sel_counts = Counter(obj.type for obj in selected)
            for obj_type, n in sorted(sel_counts.items()):
                icon = TYPE_ICONS.get(obj_type, 'DOT')
                box.label(text=f"{obj_type}: {n}", icon=icon)
            box.separator()
            box.label(text=f"Total: {len(selected)}", icon='CHECKMARK')
        else:
            box.label(text="Nothing selected", icon='ERROR')

        layout.separator()

        # ── glTF Export Settings ────────────────────────────────────
        # Subset of built-in glTF params, with pop-up-friendly defaults.
        settings = context.scene.popup_export_settings
        box = layout.box()
        box.label(text="Export Settings", icon='PREFERENCES')

        # Transform
        col = box.column(heading="Transform", align=True)
        col.prop(settings, "export_yup")

        # Scene Graph
        col = box.column(heading="Scene Graph", align=True)
        col.prop(settings, "export_hierarchy_flatten_objs")

        # Mesh
        col = box.column(heading="Mesh", align=True)
        col.prop(settings, "export_apply")
        col.prop(settings, "export_texcoords")
        col.prop(settings, "export_normals")

        layout.separator()

        # ── Action buttons ──────────────────────────────────────────
        col = layout.column(align=True)
        col.scale_y = 1.4
        col.operator(POPUP_OT_save_physics_props.bl_idname, icon='PHYSICS')

        layout.separator()

        # One-click: physics props + select by type + export
        col = layout.column(align=True)
        col.scale_y = 1.6
        col.operator(POPUP_OT_export_glb.bl_idname, icon='EXPORT')


# ── Register / Unregister ──────────────────────────────────────────

classes = (
    POPUP_PG_type_filter,
    POPUP_PG_export_settings,
    POPUP_OT_select_by_type,
    POPUP_OT_save_physics_props,
    POPUP_OT_export_glb,
    VIEW3D_PT_popup_export,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.popup_type_filter = PointerProperty(type=POPUP_PG_type_filter)
    bpy.types.Scene.popup_export_settings = PointerProperty(type=POPUP_PG_export_settings)


def unregister():
    del bpy.types.Scene.popup_export_settings
    del bpy.types.Scene.popup_type_filter
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    register()
