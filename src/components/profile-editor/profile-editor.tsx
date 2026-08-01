"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ProfileRenderer } from "@/components/profile-renderer/profile-renderer";
import { createBlock, deleteBlock, duplicateBlock, reorderBlocks, updateBlock } from "@/features/profiles/actions";
import type { BlockType, Profile, ProfileBlock, ProfileSettings } from "@/types/profiles";

const blockLabels: Record<BlockType, string> = {
  link: "Link", heading: "Título", text: "Texto", image: "Imagem", gallery: "Galeria",
  separator: "Separador", socials: "Redes sociais", youtube: "YouTube", spotify: "Spotify",
  video: "Vídeo", discord: "Discord", product: "Produto", contact: "Contato",
  countdown: "Contagem", faq: "FAQ",
};

function contentString(block: ProfileBlock, key: "text" | "url") {
  return typeof block.content[key] === "string" ? block.content[key] : "";
}

function SortableBlock({ block, onChanged, onRemoved }: { block: ProfileBlock; onChanged: (block: ProfileBlock) => void; onRemoved: (id: string) => void }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await updateBlock(formData);
      setMessage(result.message ?? (result.success ? "Salvo." : "Não foi possível salvar."));
      if (result.success) {
        onChanged({ ...block, title: String(formData.get("title") ?? ""), content: { ...block.content, text: String(formData.get("text") ?? ""), url: String(formData.get("url") ?? "") }, is_visible: formData.get("isVisible") === "on", published_at: formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))).toISOString() : null });
        router.refresh();
      }
    });
  }

  function remove() {
    if (!window.confirm("Excluir este bloco? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => { const result = await deleteBlock(block.id); if (result.success) { onRemoved(block.id); router.refresh(); } else setMessage(result.message); });
  }

  function duplicate() {
    startTransition(async () => { const result = await duplicateBlock(block.id); setMessage(result.message ?? "Bloco duplicado."); if (result.success) router.refresh(); });
  }

  const scheduledValue = block.published_at ? new Date(block.published_at).toISOString().slice(0, 16) : "";
  return <article className={`editor-block ${isDragging ? "dragging" : ""}`} ref={setNodeRef} style={style}><header><button className="drag-handle" type="button" aria-label="Reordenar bloco" {...attributes} {...listeners}><GripVertical /></button><div><span>{blockLabels[block.type]}</span><small>{block.is_visible ? <><Eye /> Visível</> : <><EyeOff /> Oculto</>}</small></div><div className="block-actions"><button type="button" onClick={duplicate} disabled={pending} aria-label="Duplicar"><Copy /></button><button type="button" onClick={remove} disabled={pending} aria-label="Excluir"><Trash2 /></button></div></header><form action={save} className="block-form"><input type="hidden" name="id" value={block.id} /><label>Título<input name="title" defaultValue={block.title} maxLength={120} /></label><label>Texto<textarea name="text" defaultValue={contentString(block, "text")} maxLength={2000} rows={2} /></label><label>URL<input name="url" type="url" defaultValue={contentString(block, "url")} placeholder="https://" /></label><div className="block-inline"><label className="check-field"><input name="isVisible" type="checkbox" defaultChecked={block.is_visible} /> Visível</label><label>Publicar em<input name="publishedAt" type="datetime-local" defaultValue={scheduledValue} /></label></div><button className="button editor-save" type="submit" disabled={pending}><Save /> {pending ? "Salvando…" : "Salvar bloco"}</button>{message && <small className="editor-message" role="status">{message}</small>}</form></article>;
}

export function ProfileEditor({ initialBlocks, profile, settings }: { initialBlocks: ProfileBlock[]; profile: Profile; settings: ProfileSettings }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedType, setSelectedType] = useState<BlockType>("link");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = blocks.findIndex((block) => block.id === event.active.id);
    const newIndex = blocks.findIndex((block) => block.id === event.over?.id);
    const previous = blocks;
    const next = arrayMove(blocks, oldIndex, newIndex).map((block, position) => ({ ...block, position }));
    setBlocks(next);
    startTransition(async () => { const result = await reorderBlocks(next.map((block) => block.id)); if (!result.success) { setBlocks(previous); setMessage(result.message); } else { setMessage("Ordem salva."); router.refresh(); } });
  }

  function addBlock() {
    startTransition(async () => { const result = await createBlock(selectedType); setMessage(result.message ?? "Bloco adicionado."); if (result.success) router.refresh(); });
  }

  return <div className="editor-workspace"><aside className="editor-tools"><span className="eyebrow">Blocos</span><h2>Construa sua página</h2><p>Adicione um bloco e arraste para reordenar.</p><select value={selectedType} onChange={(event) => setSelectedType(event.target.value as BlockType)}>{Object.entries(blockLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="button primary wide" onClick={addBlock} disabled={pending} type="button"><Plus /> Adicionar bloco</button>{message && <small role="status">{message}</small>}</aside><section className="editor-list"><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>{blocks.map((block) => <SortableBlock block={block} key={block.id} onChanged={(updated) => setBlocks((current) => current.map((item) => item.id === updated.id ? updated : item))} onRemoved={(id) => setBlocks((current) => current.filter((item) => item.id !== id))} />)}</SortableContext></DndContext>{blocks.length === 0 && <div className="editor-empty">Adicione seu primeiro bloco para começar.</div>}</section><aside className="editor-preview"><span className="eyebrow">Prévia ao vivo</span><div className="phone-preview"><ProfileRenderer profile={profile} settings={settings} blocks={blocks} preview /></div></aside></div>;
}
