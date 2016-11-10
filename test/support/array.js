/*no-extend-native: 0 */
const oldpush = Array.prototype.push;
Object.defineProperty(Array.prototype,'last',{
	configurable:true,
	get:function(){
		return this[this.length-1];
	}
});
Object.defineProperty(Array.prototype,'push',{
	configurable:true,
	value:function(obj){
		oldpush.call(this,obj);
		return obj;
	}
});
