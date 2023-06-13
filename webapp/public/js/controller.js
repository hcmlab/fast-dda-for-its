class Controller {
	constructor(pages) {
		this.pages = pages;
		this.next_page_idx = 0;
	}

	triggerNextPage() {
		if(this.next_page_idx >= this.pages.length)
		{
			return;
		}

		this.pages[this.next_page_idx].fx(...this.pages[this.next_page_idx].args);
		this.next_page_idx++;
	}
}