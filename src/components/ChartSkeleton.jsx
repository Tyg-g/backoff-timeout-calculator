import { For } from "solid-js";

import { Skeleton } from "~/components/UI";


export default function ChartSkeleton(props){
  const ticks = 8;

  return (
    <div className={`chart-skeleton flex flex-col gap-2 px-6 ${props.className}`}>

      <div className='flex h-2 gap-2 justify-between'>
        <Skeleton className='w-20 h-1'/>
        <Skeleton className='w-40'/>
      </div>

      <Skeleton className='h-full min-h-8'>
        <div className='grid-mock flex h-max mx-3 my-6'>
          <For each={Array(ticks-1)}>
            {() => <div className='grow h-10'/>}
          </For>
        </div>
      </Skeleton>

      <div className='flex h-1 gap-1 justify-between'>
        <For each={Array(ticks)}>
          {() => <Skeleton className='w-6'/>}
        </For>
      </div>

    </div>
  );
}
