import { Component, computed, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BlockTextStyle } from "../../../data-access/notes/note-blocks.model";
import {
  Selection,
  applyTextStyle,
  detectFormatting,
  toggleBlock,
  toggleInline,
} from "../../utils/toolbar-actions";

@Component({
  selector: "app-formatting-toolbar",
  imports: [FormsModule],
  templateUrl: "./formatting-toolbar.component.html",
  styleUrl: "./formatting-toolbar.component.scss",
})
export class FormattingToolbarComponent {
  selection = input.required<Selection>();
  applyChange = output<Selection>();

  protected readonly formatting = computed(() =>
    detectFormatting(this.selection()),
  );

  apply(result: Selection): void {
    this.applyChange.emit(result);
  }

  toggleInline = toggleInline;
  toggleBlock = toggleBlock;

  onStyleChange(style: BlockTextStyle): void {
    this.applyChange.emit(applyTextStyle(this.selection(), style));
  }
}
