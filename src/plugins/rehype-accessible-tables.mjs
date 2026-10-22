/** Give authored Markdown tables their own keyboard-scrollable region. */
export default function accessibleTables(){
 return function transform(tree){
  function walk(node){
   if(!node.children)return;
   node.children=node.children.map(child=>{
    walk(child);
    return child.type==='element'&&child.tagName==='table' ? {type:'element',tagName:'div',properties:{className:['table-scroll'],tabIndex:0,role:'region',ariaLabel:'表。横にスクロールできます'},children:[child]} : child;
   });
  }
  walk(tree);
 };
}
