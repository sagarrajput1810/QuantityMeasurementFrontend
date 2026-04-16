import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  isDark = signal<boolean>(false);

  constructor() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    this.isDark.set(savedTheme === 'dark');
    this.applyTheme();
  }

  toggleTheme() {
    this.isDark.update((dark) => !dark);
    localStorage.setItem(this.THEME_KEY, this.isDark() ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDark()) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      document.body.style.colorScheme = 'dark';
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      document.body.style.colorScheme = 'light';
    }
  }
}
