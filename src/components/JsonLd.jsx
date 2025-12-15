import { untrack, createUniqueId } from 'solid-js';
import { useHead } from '@solidjs/meta';


export default function JsonLd(props) {
  const json = untrack( () => props.json );

  json["@context"] = "https://schema.org";

  useHead({
    tag: 'script',
    props: {
      type: 'application/ld+json',
      children: JSON.stringify(json),
    },
    setting: {close: true},
    id: createUniqueId(),
    name: '',
  });

  return null;
}
