"use client";

import { useEffect } from "react";

/** Zapobiega otwieraniu pliku w oknie przy drop poza strefą uploadu. */
export function usePreventWindowFileDrop() {
	useEffect(() => {
		function onDragOver(event: DragEvent) {
			event.preventDefault();
		}
		function onDrop(event: DragEvent) {
			event.preventDefault();
		}
		window.addEventListener("dragover", onDragOver);
		window.addEventListener("drop", onDrop);
		return () => {
			window.removeEventListener("dragover", onDragOver);
			window.removeEventListener("drop", onDrop);
		};
	}, []);
}
