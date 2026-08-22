import { Component, computed, input } from "@angular/core";
import {
  LucideDynamicIcon,
  LucideIcon,
  LucideSearch,
  LucideLayoutGrid,
  LucideList,
  LucideMoreVertical,
  LucidePlus,
  LucideTrash2,
  LucideCheck,
  LucideUpload,
  LucideDownload,
  LucideArrowUpDown,
  LucideInfo,
  LucideSun,
  LucideMoon,
  LucideMonitor,
  LucideLogOut,
  LucideArrowLeft,
  LucideX,
  LucidePencil,
} from "@lucide/angular";
import { IconName } from "./icon-name";

const ICONS: Record<IconName, LucideIcon> = {
  search: LucideSearch,
  grid: LucideLayoutGrid,
  list: LucideList,
  more: LucideMoreVertical,
  add: LucidePlus,
  delete: LucideTrash2,
  check: LucideCheck,
  upload: LucideUpload,
  download: LucideDownload,
  sort: LucideArrowUpDown,
  info: LucideInfo,
  sun: LucideSun,
  moon: LucideMoon,
  desktop: LucideMonitor,
  logout: LucideLogOut,
  back: LucideArrowLeft,
  close: LucideX,
  edit: LucidePencil,
};

@Component({
  selector: "app-icon",
  imports: [LucideDynamicIcon],
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
})
export class IconComponent {
  name = input.required<IconName>();
  size = input(20);

  readonly icon = computed(() => ICONS[this.name()]);
}
