import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Measurement } from '../../services/measurement';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private measurementService = inject(Measurement);
  public themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['type', 'inputValue', 'fromUnit', 'operation', 'convertedValue', 'toUnit', 'createdAt'];
  dataSource: any[] = [];
  errorMessage: string = '';

  ngOnInit() {
    this.fetchHistory();
  }

  async fetchHistory() {
    try {
      this.dataSource = await this.measurementService.getHistory();
      this.cdr.detectChanges();
    } catch (err: any) {
      this.errorMessage = err;
      this.cdr.detectChanges();
    }
  }

  async clearHistory() {
    if (confirm('Are you sure you want to delete all history?')) {
      try {
        await this.measurementService.deleteHistory();
        this.dataSource = [];
        this.cdr.detectChanges();
      } catch (err: any) {
        this.errorMessage = err;
        this.cdr.detectChanges();
      }
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'CONVERSION': return 'primary';
      case 'COMPARISON': return 'accent';
      case 'OPERATION': return 'warn';
      default: return '';
    }
  }
}
