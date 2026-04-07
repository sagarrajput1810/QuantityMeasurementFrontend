import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Measurement } from '../../services/measurement';

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
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private measurementService = inject(Measurement);

  displayedColumns: string[] = ['id', 'originalValue', 'originalUnit', 'convertedValue', 'convertedUnit', 'timestamp'];
  dataSource: any[] = [];
  errorMessage: string = '';

  ngOnInit() {
    this.fetchHistory();
  }

  async fetchHistory() {
    try {
      this.dataSource = await this.measurementService.getHistory();
    } catch (err: any) {
      this.errorMessage = err;
    }
  }
}
