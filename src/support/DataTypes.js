import ExtendedStrings from './ExtendedStrings';

let datatypes = new ExtendedStrings('koaton');
datatypes.add('number', 'ember:number caminte:Number crud:number');
datatypes.add('integer', 'ember:number caminte:Integer crud:number');
datatypes.add('float', 'ember:number caminte:Float crud:number');
datatypes.add('double', 'ember:number caminte:Double crud:number');
datatypes.add('real', 'ember:number caminte:Real crud:number');
datatypes.add('boolean', 'ember:boolean caminte:Boolean crud:boolean');
datatypes.add('string', 'ember:string caminte:String crud:text');
datatypes.add('text', 'ember:string caminte:Text crud:text');
datatypes.add('json', 'ember:undefined caminte:Json crud:undefined');
datatypes.add('date', 'ember:date caminte:Date crud:date');
datatypes.add('email', 'ember:string caminte:Email crud:email');
datatypes.add('password', 'ember:string caminte:String crud:password');
datatypes.add('blob', 'ember:string caminte:Blob crud:text');
makeObjIterable(datatypes);
Object.freeze(datatypes);

export default datatypes;
