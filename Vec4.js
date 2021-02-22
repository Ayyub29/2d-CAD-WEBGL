var x = 0;
var y = 0;
var z = 0;
var w = 0;

function Vec4(x, y, z, w) {
  this.x = x != null ? x : 0;
  this.y = y != null ? y : 0;
  this.z = z != null ? z : 0;
  this.w = w != null ? w : 0;
}

Vec4.create = function(x, y, z, w) {
    return new Vec4(x, y, z, w);
  };


Vec4.fromArray = function(a) {
return new Vec4(a[0], a[1], a[2], a[3]);
}

Vec4.prototype.set = function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  };

Vec4.prototype.setVec4 = function(v) {
this.x = v.x;
this.y = v.y;
this.z = v.z;
this.w = v.w;
return this;
};