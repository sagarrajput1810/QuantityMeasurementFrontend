import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
  compareForm: FormGroup;
  operationForm: FormGroup;

  convertedValue: number | null = null;
  comparisonResult: boolean | null = null;
  operationResult: { value: number, unit: string } | null = null;
  errorMessage: string = '';

  constructor() {
    this.conversionForm = this.fb.group({
      value: [0],
      fromUnit: ['INCH'],
      toUnit: ['FEET'],
    });

    this.compareForm = this.fb.group({
      value1: [0],
      unit1: ['INCH'],
      value2: [0],
      unit2: ['INCH'],
    });

    this.operationForm = this.fb.group({
      value1: [0],
      unit1: ['INCH'],
      value2: [0],
      unit2: ['INCH'],
      operation: ['add'],
    });
  }

  ngOnInit() {
    this.userName = this.authService.getUserName();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    const categoryUnits = this.units[category];
    const defaultUnit1 = categoryUnits[0];
    const defaultUnit2 = categoryUnits[1] || categoryUnits[0];

    this.conversionForm.patchValue({
      fromUnit: defaultUnit1,
      toUnit: defaultUnit2,
    });

    this.compareForm.patchValue({
      unit1: defaultUnit1,
      unit2: defaultUnit2,
    });

    this.operationForm.patchValue({
      unit1: defaultUnit1,
      unit2: defaultUnit1,
    });

    // Clear previous results when category changes
    this.convertedValue = null;
    this.comparisonResult = null;
    this.operationResult = null;
    this.errorMessage = '';
    
    this.cdr.detectChanges();
  }

  async performConversion() {
    const { value, fromUnit, toUnit } = this.conversionForm.value;
    try {
      const result = await this.measurementService.convert({ value, fromUnit, toUnit });
      this.convertedValue = result.convertedValue;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (err: any) {
      this.errorMessage = err;
      this.convertedValue = null;
      this.cdr.detectChanges();
    }
  }

  async performComparison() {
    const { value1, unit1, value2, unit2 } = this.compareForm.value;
    try {
      const result = await this.measurementService.compare({ value1, unit1, value2, unit2 });
      this.comparisonResult = result.isEqual;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (err: any) {
      this.errorMessage = err;
      this.comparisonResult = null;
      this.cdr.detectChanges();
    }
  }

  async performOperation() {
    const { value1, unit1, value2, unit2, operation } = this.operationForm.value;
    
    if (operation === 'div' && value2 === 0) {
      this.errorMessage = 'Cannot divide by zero';
      return;
    }

    try {
      const result = await this.measurementService.performOperation({ value1, unit1, value2, unit2, operation });
      this.operationResult = result;
      this.errorMessage = '';
      this.cdr.detectChanges();
    } catch (err: any) {
      this.errorMessage = err;
      this.operationResult = null;
      this.cdr.detectChanges();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
