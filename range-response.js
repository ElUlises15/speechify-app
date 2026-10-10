/** Cached media must answer byte ranges for Safari and native audio seeking. */
export async function rangeResponse(response,header) {
  if(!header)return response;
  const blob=await response.blob(),size=blob.size,match=/^bytes=(\d*)-(\d*)$/.exec(header);
  const invalid=()=>new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  if(!match || (!match[1]&&!match[2]))return invalid();
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  const end=match[1]?(match[2]?Math.min(size-1,Number(match[2])):size-1):size-1;
  if(start>=size||start>end||size===0)return invalid();
  const headers=new Headers(response.headers);headers.delete('Content-Encoding');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(blob.slice(start,end+1),{status:206,headers});
}
