
const docs = await Evidence.find({}, { fileHash: 1 });
console.log(docs);
