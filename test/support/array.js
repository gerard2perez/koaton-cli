/*no-extend-native: 0 */
const oldpush = Array.prototype.push;
Object.defineProperty(Array.prototype,'last',{
	get:function(){
		return this[this.length-1];
	}
});
Object.defineProperty(Array.prototype,'push',{
	value:function(obj){
		oldpush.call(this,obj);
		return obj;
	}
});
