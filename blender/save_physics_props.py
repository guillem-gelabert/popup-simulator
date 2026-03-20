import bpy

for obj in bpy.data.objects:
    if obj.rigid_body:
        rb = obj.rigid_body
        obj["rb_type"] = rb.type           # 'ACTIVE' or 'PASSIVE'
        obj["rb_animated"] = rb.kinematic   # the "Animated" checkbox
        obj["rb_dynamic"] = rb.enabled       # the "Dynamic" checkbox

    if obj.rigid_body_constraint:
        rbc = obj.rigid_body_constraint
        obj["rbc_type"] = rbc.type          # 'HINGE', 'FIXED', etc.
        if rbc.object1:
            obj["rbc_object1"] = rbc.object1.name
        if rbc.object2:
            obj["rbc_object2"] = rbc.object2.name