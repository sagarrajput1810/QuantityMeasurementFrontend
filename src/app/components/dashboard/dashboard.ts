import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Auth } from '../../services/auth';
import { Measurement } from '../../services/measurement';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private measurementService = inject(Measurement);
  private router = inject(Router);

  userName: string | null = '';

  categories = [
    { label: 'Length', value: 'LENGTH', icon: 'straighten' },
    { label: 'Volume', value: 'VOLUME', icon: 'opacity' },
    { label: 'Weight', value: 'WEIGHT', icon: 'fitness_center' },
    { label: 'Temperature', value: 'TEMPERATURE', icon: 'thermostat' },
  ];

  units: { [key: string]: string[] } = {
    LENGTH: ['INCH', 'FEET', 'YARD', 'CM'],
    VOLUME: ['LITER', 'GALLON', 'ML'],
    WEIGHT: ['GRAM', 'KG', 'TONNE'],
    TEMPERATURE: ['CELSIUS', 'FAHRENHEIT'],
  };

  selectedCategory = 'LENGTH';
  conversionForm: FormGroup;

  convertedValue: number | null = null;
  errorMessage: string = '';

  constructor() {
    this.conversionForm = this.fb.group({
      value: [0],
      fromUnit: ['INCH'],
      toUnit: ['FEET'],
    });
  }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.setupFormListeners();
    this.performConversion();
  }

  setupFormListeners() {
    this.conversionForm.valueChanges.subscribe(() => {
      this.performConversion();
    });
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    const categoryUnits = this.units[category];
    this.conversionForm.patchValue({
      fromUnit: categoryUnits[0],
      toUnit: categoryUnits[1] || categoryUnits[0],
    }, { emitEvent: true });
  }

  async performConversion() {
    const { value, fromUnit, toUnit } = this.conversionForm.value;
    if (value === null || value === undefined) return;

    try {
      const result = await this.measurementService.convert({ value, fromUnit, toUnit });
      this.convertedValue = result.convertedValue;
      this.errorMessage = '';
    } catch (err: any) {
      this.errorMessage = err;
      this.convertedValue = null;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
