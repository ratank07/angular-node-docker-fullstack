import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';


interface Developer {
  id: number;
  name: string;
  role: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  developers = signal<Developer[]>([]);
  loading = signal(true);
  error= signal('');

  ngOnInit(): void {
    this.loadDevelopers();
  }

   async loadDevelopers(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response  = await fetch('api/developers');
      if (!response.ok) {
        throw new Error('Failed to fetch developers');
      }
      const developers = await response.json();
      this.developers.set(developers);
    } catch (error) {
      this.error.set('Failed to load developers');
    }
  }
  
  async addDeveloper(event: SubmitEvent, nameInput: HTMLInputElement, roleInput: HTMLInputElement): Promise<void> {
    event.preventDefault();
    const name = nameInput.value.trim();
    const role = roleInput.value.trim();

    if(!name || !role) {
       this.error.set('Name and role are required');
       return;
    }
    this.error.set('');

    try {
      const response = await fetch('api/developers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({name, role })
      });
      const newDeveloper = await response.json();
      this.developers.update((items) => [...items, newDeveloper]);
      nameInput.value = '';
      roleInput.value = '';

    } catch (error) {
      this.error.set('Failed to add developer');
    }
  }

}
