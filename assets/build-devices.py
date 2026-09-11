"""Photo-reconstructed S2/G2 presentation models, metres; not manufacturer CAD."""
import bpy, math, os
from mathutils import Vector
ROOT=os.path.dirname(os.path.abspath(__file__))
def mat(name,color,metal=0,rough=.35):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 return m
def cube(name,size,loc,material,r=.006,parent=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 if r:
  mod=o.modifiers.new('Machined soft edges','BEVEL');mod.width=r;mod.segments=4
  o.modifiers.new('Surface normals','WEIGHTED_NORMAL')
 if parent:o.parent=parent
 return o
def group(name,loc,angle=0):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler.x=angle;return o
def panel(name,w,h,loc,tilt,reverse=False,white=False):
 g=group(name+'Assembly',loc,tilt);g.rotation_euler.z=math.pi if reverse else 0
 cube(name+'SilverEdge',(w,h*.10,h),(0,0,0),silver if not white else ivory,.011,g)
 cube(name+'Bezel',(w-.008,.006,h-.008),(0,-h*.05-.002,0),black,.010,g)
 bpy.ops.mesh.primitive_plane_add(size=1);o=bpy.context.object;o.name=name;o.parent=g;o.location=(0,-h*.05-.005,0);o.rotation_euler.x=math.pi/2;o.scale=(w-.037,h-.039,1);o.data.materials.append(display)
 return g
def wedge(name,width,points,material):
 verts=[(x,y,z) for x in [-width/2,width/2] for y,z in points];n=len(points);faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.data.materials.append(material);mod=o.modifiers.new('Rounded housing','BEVEL');mod.width=.006;mod.segments=4;o.modifiers.new('Normals','WEIGHTED_NORMAL');return o
def detail(name,size,loc,material):return cube(name,size,loc,material,.001)
for kind in ['s2','g2']:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 graphite=mat('Graphite alloy',(.075,.078,.095),.65);silver=mat('Silver edge',(.48,.5,.54),.8);black=mat('Black bezel',(.008,.01,.015),.15,.24);ivory=mat('White enclosure',(.84,.86,.88),.18);display=mat('Display placeholder',(.025,.17,.22),0,.5);blue=mat('Power button',(.02,.30,.56),.25)
 if kind=='s2':
  cube('Wide low plinth',(.39,.28,.012),(0,0,.008),graphite,.01)
  cube('Plinth silver rim',(.387,.277,.004),(0,0,.016),silver,.009)
  wedge('Broad inclined main support',.235,[(-.072,.018),(-.038,.018),(.067,.265),(.032,.265)],graphite)
  panel('Screen_Main',.382,.247,(0,.008,.282),-.18)
  wedge('Customer display integrated foot',.237,[(.043,.019),(.123,.019),(.058,.205),(.029,.205)],graphite)
  panel('Screen_Customer',.236,.166,(0,.091,.166),.25,True)
  detail('Customer camera surround',(.027,.005,.022),(-.080,.117,.228),silver)
  detail('Customer camera lens',(.010,.006,.010),(-.080,.121,.229),black)
  detail('Cable recess',(.075,.014,.016),(0,.126,.032),black)
  for i in range(17):detail('Main ventilation',(.006,.007,.015),(-.083+i*.010,-.019,.149),black)
  detail('Power key',(.009,.006,.009),(.091,-.033,.093),blue)
 else:
  cube('Thin rounded plinth',(.31,.29,.011),(0,0,.007),ivory,.01)
  wedge('Continuous G2 enclosure',.267,[(-.131,.017),(.112,.017),(.079,.191),(.064,.49),(.018,.56),(-.050,.563),(-.089,.211)],ivory)
  panel('Screen_Main',.276,.376,(0,-.090,.397),-.15,white=True)
  # Front peripheral module: separate receipt printer and contactless/scanner.
  face=group('Sloped peripheral fascia',(0,-.106,.115),-.17)
  cube('Printer recessed panel',(.124,.010,.153),(-.067,0,0),black,.005,face)
  cube('Printer door',(.111,.006,.113),(-.067,-.008,-.012),graphite,.002,face)
  cube('Receipt output slot',(.094,.006,.004),(-.067,-.009,.052),black,.001,face)
  cube('Printer indicator',(.008,.007,.009),(-.021,-.009,.062),silver,.001,face)
  cube('Contactless and scanner panel',(.108,.010,.153),(.067,0,0),black,.010,face)
  cube('Scanner white surround',(.086,.019,.059),(.067,-.012,-.029),ivory,.003,face)
  cube('Scanner glass window',(.068,.007,.017),(.067,-.023,-.014),graphite,.002,face)
  for i in range(3):
   bpy.ops.mesh.primitive_torus_add(major_radius=.010+i*.006,minor_radius=.001,major_segments=24,minor_segments=6);o=bpy.context.object;o.name='Contactless rings';o.parent=face;o.location=(.067,-.007,.04);o.rotation_euler.x=math.pi/2;o.data.materials.append(graphite)
  panel('Screen_Rear',.218,.139,(0,.105,.356),.16,True,True)
  for row in range(7):
   for col in range(3):detail('Side cooling vents',(.002,.004,.004),(.135,.003+col*.012,.20+row*.013),graphite)
  detail('Blue power button',(.004,.015,.019),(.136,-.065,.042),blue)
  for y in [-.039,-.020]:detail('Side port',(.004,.012,.004),(.136,y,.04),black)
 bpy.ops.object.select_all(action='SELECT')
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,kind+'.blend'))
 bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,kind+'.glb'),export_format='GLB',use_selection=True,export_apply=True)
 # Product inspection render, excluded from exported geometry.
 bpy.ops.object.camera_add(location=(.85,-1.1,.78));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.27))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=.75;bpy.context.scene.camera=cam
 for loc,energy,size in [((1,-1,2),80,2),((-1,-.5,1),55,1),((0,1,2),90,1)]:
  bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=energy;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,.2))-l.location).to_track_quat('-Z','Y').to_euler()
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.world.color=(.2,.2,.2);scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(ROOT,kind+'-model.png');bpy.ops.render.render(write_still=True)
