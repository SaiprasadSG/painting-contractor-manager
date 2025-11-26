#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Painting Contractor App
Tests all CRUD operations, stock management, reports, and Excel exports
"""

import requests
import json
import sys
from datetime import datetime, date
import time

# Backend URL from frontend/.env
BASE_URL = "https://paintpro-tracker.preview.emergentagent.com/api"

class PaintingContractorAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_data = {
            'sites': [],
            'materials': [],
            'labours': [],
            'logs': [],
            'overheads': []
        }
        self.test_results = []
        
    def log_result(self, test_name, success, message="", data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'data': data
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if not success and data:
            print(f"   Response: {data}")
        print()

    def test_health_check(self):
        """Test API health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Health Check", True, f"API is healthy: {data.get('message', '')}")
                return True
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
            return False

    def test_sites_crud(self):
        """Test Sites CRUD operations"""
        print("=== TESTING SITES CRUD ===")
        
        # Test data for sites
        sites_data = [
            {
                "name": "Residential Villa - Bandra",
                "owner_name": "Rajesh Sharma",
                "owner_phone": "9876543210",
                "owner_email": "rajesh.sharma@email.com",
                "location": "Plot 15, Bandra West, Mumbai",
                "maps_link": "https://maps.google.com/villa-bandra",
                "start_date": "2025-01-15",
                "status": "Running"
            },
            {
                "name": "Commercial Office - Andheri",
                "owner_name": "Priya Patel",
                "owner_phone": "9123456789",
                "owner_email": "priya.patel@company.com",
                "location": "Office Complex, Andheri East, Mumbai",
                "maps_link": "https://maps.google.com/office-andheri",
                "start_date": "2025-01-20",
                "status": "Running"
            },
            {
                "name": "Apartment Complex - Powai",
                "owner_name": "Amit Kumar",
                "owner_phone": "9988776655",
                "location": "Building A, Powai, Mumbai",
                "start_date": "2025-01-10",
                "status": "On Hold"
            }
        ]
        
        # CREATE Sites
        for site_data in sites_data:
            try:
                response = requests.post(f"{self.base_url}/sites", json=site_data, timeout=10)
                if response.status_code == 200:
                    site = response.json()
                    self.test_data['sites'].append(site)
                    self.log_result(f"Create Site: {site_data['name']}", True, f"Site ID: {site['site_id']}")
                else:
                    self.log_result(f"Create Site: {site_data['name']}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result(f"Create Site: {site_data['name']}", False, f"Error: {str(e)}")
        
        # READ Sites
        try:
            response = requests.get(f"{self.base_url}/sites", timeout=10)
            if response.status_code == 200:
                sites = response.json()
                self.log_result("Get All Sites", True, f"Retrieved {len(sites)} sites")
            else:
                self.log_result("Get All Sites", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get All Sites", False, f"Error: {str(e)}")
        
        # UPDATE Site
        if self.test_data['sites']:
            site_to_update = self.test_data['sites'][0].copy()
            site_to_update['status'] = 'Completed'
            site_to_update['owner_phone'] = '9999888777'
            
            try:
                response = requests.put(f"{self.base_url}/sites/{site_to_update['site_id']}", 
                                      json=site_to_update, timeout=10)
                if response.status_code == 200:
                    updated_site = response.json()
                    self.test_data['sites'][0] = updated_site
                    self.log_result("Update Site", True, f"Updated status to: {updated_site['status']}")
                else:
                    self.log_result("Update Site", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("Update Site", False, f"Error: {str(e)}")

    def test_materials_crud(self):
        """Test Materials CRUD operations"""
        print("=== TESTING MATERIALS CRUD ===")
        
        # Test data for materials
        materials_data = [
            {
                "name": "Asian Paints Royale - White",
                "unit": "bucket",
                "rate_per_unit": 1200.0,
                "current_stock": 50.0
            },
            {
                "name": "Berger Paint - Blue",
                "unit": "bucket", 
                "rate_per_unit": 1100.0,
                "current_stock": 30.0
            },
            {
                "name": "Paint Brush - 4 inch",
                "unit": "piece",
                "rate_per_unit": 150.0,
                "current_stock": 25.0
            },
            {
                "name": "Paint Roller",
                "unit": "piece",
                "rate_per_unit": 200.0,
                "current_stock": 15.0
            }
        ]
        
        # CREATE Materials
        for material_data in materials_data:
            try:
                response = requests.post(f"{self.base_url}/materials", json=material_data, timeout=10)
                if response.status_code == 200:
                    material = response.json()
                    self.test_data['materials'].append(material)
                    self.log_result(f"Create Material: {material_data['name']}", True, 
                                  f"Stock: {material['current_stock']} {material['unit']}")
                else:
                    self.log_result(f"Create Material: {material_data['name']}", False, 
                                  f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result(f"Create Material: {material_data['name']}", False, f"Error: {str(e)}")
        
        # READ Materials
        try:
            response = requests.get(f"{self.base_url}/materials", timeout=10)
            if response.status_code == 200:
                materials = response.json()
                self.log_result("Get All Materials", True, f"Retrieved {len(materials)} materials")
            else:
                self.log_result("Get All Materials", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get All Materials", False, f"Error: {str(e)}")
        
        # UPDATE Material
        if self.test_data['materials']:
            material_to_update = self.test_data['materials'][0].copy()
            material_to_update['current_stock'] = 60.0
            material_to_update['rate_per_unit'] = 1250.0
            
            try:
                response = requests.put(f"{self.base_url}/materials/{material_to_update['material_id']}", 
                                      json=material_to_update, timeout=10)
                if response.status_code == 200:
                    updated_material = response.json()
                    self.test_data['materials'][0] = updated_material
                    self.log_result("Update Material", True, 
                                  f"Updated stock to: {updated_material['current_stock']}")
                else:
                    self.log_result("Update Material", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("Update Material", False, f"Error: {str(e)}")

    def test_labours_crud(self):
        """Test Labour CRUD operations"""
        print("=== TESTING LABOUR CRUD ===")
        
        # Test data for labours
        labours_data = [
            {
                "name": "Ramesh Painter",
                "rate_per_day": 800.0
            },
            {
                "name": "Suresh Helper",
                "rate_per_day": 600.0
            },
            {
                "name": "Mahesh Senior Painter",
                "rate_per_day": 1000.0
            }
        ]
        
        # CREATE Labours
        for labour_data in labours_data:
            try:
                response = requests.post(f"{self.base_url}/labours", json=labour_data, timeout=10)
                if response.status_code == 200:
                    labour = response.json()
                    self.test_data['labours'].append(labour)
                    self.log_result(f"Create Labour: {labour_data['name']}", True, 
                                  f"Rate: ₹{labour['rate_per_day']}/day")
                else:
                    self.log_result(f"Create Labour: {labour_data['name']}", False, 
                                  f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result(f"Create Labour: {labour_data['name']}", False, f"Error: {str(e)}")
        
        # READ Labours
        try:
            response = requests.get(f"{self.base_url}/labours", timeout=10)
            if response.status_code == 200:
                labours = response.json()
                self.log_result("Get All Labours", True, f"Retrieved {len(labours)} labours")
            else:
                self.log_result("Get All Labours", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get All Labours", False, f"Error: {str(e)}")
        
        # UPDATE Labour
        if self.test_data['labours']:
            labour_to_update = self.test_data['labours'][0].copy()
            labour_to_update['rate_per_day'] = 850.0
            
            try:
                response = requests.put(f"{self.base_url}/labours/{labour_to_update['labour_id']}", 
                                      json=labour_to_update, timeout=10)
                if response.status_code == 200:
                    updated_labour = response.json()
                    self.test_data['labours'][0] = updated_labour
                    self.log_result("Update Labour", True, 
                                  f"Updated rate to: ₹{updated_labour['rate_per_day']}/day")
                else:
                    self.log_result("Update Labour", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("Update Labour", False, f"Error: {str(e)}")

    def get_material_stock(self, material_id):
        """Helper function to get current stock of a material"""
        try:
            response = requests.get(f"{self.base_url}/materials", timeout=10)
            if response.status_code == 200:
                materials = response.json()
                for material in materials:
                    if material['material_id'] == material_id:
                        return material['current_stock']
        except:
            pass
        return None

    def test_daily_logs_with_stock_management(self):
        """Test Daily Logs CRUD with critical stock management"""
        print("=== TESTING DAILY LOGS WITH STOCK MANAGEMENT ===")
        
        if not self.test_data['sites'] or not self.test_data['materials'] or not self.test_data['labours']:
            self.log_result("Daily Logs Test", False, "Missing prerequisite data (sites, materials, labours)")
            return
        
        # Get initial stock levels
        initial_stocks = {}
        for material in self.test_data['materials']:
            initial_stocks[material['material_id']] = self.get_material_stock(material['material_id'])
        
        # Create daily log with materials and labours
        site = self.test_data['sites'][0]
        materials_used = [
            {
                "material_id": self.test_data['materials'][0]['material_id'],
                "material_name": self.test_data['materials'][0]['name'],
                "quantity": 5.0,
                "rate_per_unit": self.test_data['materials'][0]['rate_per_unit'],
                "total_cost": 5.0 * self.test_data['materials'][0]['rate_per_unit']
            },
            {
                "material_id": self.test_data['materials'][1]['material_id'],
                "material_name": self.test_data['materials'][1]['name'],
                "quantity": 3.0,
                "rate_per_unit": self.test_data['materials'][1]['rate_per_unit'],
                "total_cost": 3.0 * self.test_data['materials'][1]['rate_per_unit']
            }
        ]
        
        labours_used = [
            {
                "labour_id": self.test_data['labours'][0]['labour_id'],
                "labour_name": self.test_data['labours'][0]['name'],
                "count": 2,
                "rate_per_day": self.test_data['labours'][0]['rate_per_day'],
                "total_cost": 2 * self.test_data['labours'][0]['rate_per_day']
            }
        ]
        
        log_data = {
            "site_id": site['site_id'],
            "site_name": site['name'],
            "log_date": "2025-01-15",
            "materials_used": materials_used,
            "labours_used": labours_used,
            "notes": "First day painting work - exterior walls"
        }
        
        # CREATE Daily Log
        try:
            response = requests.post(f"{self.base_url}/site-logs", json=log_data, timeout=10)
            if response.status_code == 200:
                log = response.json()
                self.test_data['logs'].append(log)
                
                # Verify cost calculations
                expected_material_cost = sum(m['total_cost'] for m in materials_used)
                expected_labour_cost = sum(l['total_cost'] for l in labours_used)
                expected_total = expected_material_cost + expected_labour_cost
                
                cost_correct = (log['total_material_cost'] == expected_material_cost and 
                              log['total_labour_cost'] == expected_labour_cost and
                              log['total_cost'] == expected_total)
                
                self.log_result("Create Daily Log", True, 
                              f"Log ID: {log['log_id']}, Total Cost: ₹{log['total_cost']}")
                self.log_result("Cost Calculation Verification", cost_correct,
                              f"Material: ₹{log['total_material_cost']}, Labour: ₹{log['total_labour_cost']}, Total: ₹{log['total_cost']}")
                
                # CRITICAL TEST: Verify stock reduction
                time.sleep(1)  # Small delay to ensure DB update
                stock_reduced_correctly = True
                for material_used in materials_used:
                    material_id = material_used['material_id']
                    current_stock = self.get_material_stock(material_id)
                    expected_stock = initial_stocks[material_id] - material_used['quantity']
                    
                    if current_stock != expected_stock:
                        stock_reduced_correctly = False
                        self.log_result(f"Stock Reduction - {material_used['material_name']}", False,
                                      f"Expected: {expected_stock}, Got: {current_stock}")
                    else:
                        self.log_result(f"Stock Reduction - {material_used['material_name']}", True,
                                      f"Stock reduced from {initial_stocks[material_id]} to {current_stock}")
                
            else:
                self.log_result("Create Daily Log", False, f"Status: {response.status_code}", response.text)
                return
        except Exception as e:
            self.log_result("Create Daily Log", False, f"Error: {str(e)}")
            return
        
        # READ Daily Logs
        try:
            response = requests.get(f"{self.base_url}/site-logs", timeout=10)
            if response.status_code == 200:
                logs = response.json()
                self.log_result("Get All Daily Logs", True, f"Retrieved {len(logs)} logs")
            else:
                self.log_result("Get All Daily Logs", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get All Daily Logs", False, f"Error: {str(e)}")
        
        # READ Daily Logs by Site
        try:
            response = requests.get(f"{self.base_url}/site-logs?site_id={site['site_id']}", timeout=10)
            if response.status_code == 200:
                site_logs = response.json()
                self.log_result("Get Site Daily Logs", True, f"Retrieved {len(site_logs)} logs for site")
            else:
                self.log_result("Get Site Daily Logs", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get Site Daily Logs", False, f"Error: {str(e)}")
        
        # UPDATE Daily Log - Test stock restoration and new deduction
        if self.test_data['logs']:
            log_to_update = self.test_data['logs'][0].copy()
            
            # Change materials used
            new_materials_used = [
                {
                    "material_id": self.test_data['materials'][0]['material_id'],
                    "material_name": self.test_data['materials'][0]['name'],
                    "quantity": 8.0,  # Increased quantity
                    "rate_per_unit": self.test_data['materials'][0]['rate_per_unit'],
                    "total_cost": 8.0 * self.test_data['materials'][0]['rate_per_unit']
                }
            ]
            
            log_to_update['materials_used'] = new_materials_used
            log_to_update['notes'] = "Updated - more paint needed"
            
            # Get stock before update
            stock_before_update = {}
            for material in self.test_data['materials']:
                stock_before_update[material['material_id']] = self.get_material_stock(material['material_id'])
            
            try:
                response = requests.put(f"{self.base_url}/site-logs/{log_to_update['log_id']}", 
                                      json=log_to_update, timeout=10)
                if response.status_code == 200:
                    updated_log = response.json()
                    self.test_data['logs'][0] = updated_log
                    self.log_result("Update Daily Log", True, f"Updated log with new materials")
                    
                    # CRITICAL TEST: Verify stock update (old restored, new deducted)
                    time.sleep(1)  # Small delay to ensure DB update
                    
                    # For material 0: old quantity was 5, new is 8, so net change is -3
                    material_0_id = self.test_data['materials'][0]['material_id']
                    current_stock = self.get_material_stock(material_0_id)
                    expected_stock = stock_before_update[material_0_id] - 3.0  # Net additional usage
                    
                    if current_stock == expected_stock:
                        self.log_result("Stock Update on Log Edit", True,
                                      f"Stock correctly updated: {current_stock}")
                    else:
                        self.log_result("Stock Update on Log Edit", False,
                                      f"Expected: {expected_stock}, Got: {current_stock}")
                    
                    # For material 1: was 3, now 0, so should be restored by 3
                    material_1_id = self.test_data['materials'][1]['material_id']
                    current_stock_1 = self.get_material_stock(material_1_id)
                    expected_stock_1 = stock_before_update[material_1_id] + 3.0  # Restored
                    
                    if current_stock_1 == expected_stock_1:
                        self.log_result("Stock Restoration on Material Removal", True,
                                      f"Stock correctly restored: {current_stock_1}")
                    else:
                        self.log_result("Stock Restoration on Material Removal", False,
                                      f"Expected: {expected_stock_1}, Got: {current_stock_1}")
                    
                else:
                    self.log_result("Update Daily Log", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("Update Daily Log", False, f"Error: {str(e)}")
        
        # Create another daily log for testing deletion
        log_data_2 = {
            "site_id": site['site_id'],
            "site_name": site['name'],
            "log_date": "2025-01-16",
            "materials_used": [
                {
                    "material_id": self.test_data['materials'][2]['material_id'],
                    "material_name": self.test_data['materials'][2]['name'],
                    "quantity": 10.0,
                    "rate_per_unit": self.test_data['materials'][2]['rate_per_unit'],
                    "total_cost": 10.0 * self.test_data['materials'][2]['rate_per_unit']
                }
            ],
            "labours_used": labours_used,
            "notes": "Second day work - interior painting"
        }
        
        # Get stock before creating second log
        material_2_stock_before = self.get_material_stock(self.test_data['materials'][2]['material_id'])
        
        try:
            response = requests.post(f"{self.base_url}/site-logs", json=log_data_2, timeout=10)
            if response.status_code == 200:
                log_2 = response.json()
                self.test_data['logs'].append(log_2)
                self.log_result("Create Second Daily Log", True, f"Log ID: {log_2['log_id']}")
                
                # DELETE Daily Log - Test stock restoration
                time.sleep(1)
                stock_before_delete = self.get_material_stock(self.test_data['materials'][2]['material_id'])
                
                response = requests.delete(f"{self.base_url}/site-logs/{log_2['log_id']}", timeout=10)
                if response.status_code == 200:
                    self.log_result("Delete Daily Log", True, "Log deleted successfully")
                    
                    # CRITICAL TEST: Verify stock restoration on deletion
                    time.sleep(1)
                    stock_after_delete = self.get_material_stock(self.test_data['materials'][2]['material_id'])
                    expected_stock_after_delete = stock_before_delete + 10.0  # Restored
                    
                    if stock_after_delete == expected_stock_after_delete:
                        self.log_result("Stock Restoration on Log Delete", True,
                                      f"Stock restored from {stock_before_delete} to {stock_after_delete}")
                    else:
                        self.log_result("Stock Restoration on Log Delete", False,
                                      f"Expected: {expected_stock_after_delete}, Got: {stock_after_delete}")
                else:
                    self.log_result("Delete Daily Log", False, f"Status: {response.status_code}", response.text)
            else:
                self.log_result("Create Second Daily Log", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Create Second Daily Log", False, f"Error: {str(e)}")

    def test_overheads_crud(self):
        """Test Overheads CRUD operations"""
        print("=== TESTING OVERHEADS CRUD ===")
        
        if not self.test_data['sites']:
            self.log_result("Overheads Test", False, "Missing prerequisite data (sites)")
            return
        
        site = self.test_data['sites'][0]
        
        # Test data for overheads
        overheads_data = [
            {
                "site_id": site['site_id'],
                "site_name": site['name'],
                "date": "2025-01-15",
                "category": "Transport",
                "amount": 500.0,
                "description": "Fuel and vehicle charges"
            },
            {
                "site_id": site['site_id'],
                "site_name": site['name'],
                "date": "2025-01-15",
                "category": "Food",
                "amount": 300.0,
                "description": "Lunch for workers"
            },
            {
                "site_id": site['site_id'],
                "site_name": site['name'],
                "date": "2025-01-16",
                "category": "Scaffolding",
                "amount": 1200.0,
                "description": "Scaffolding rental for 2 days"
            }
        ]
        
        # CREATE Overheads
        for overhead_data in overheads_data:
            try:
                response = requests.post(f"{self.base_url}/overheads", json=overhead_data, timeout=10)
                if response.status_code == 200:
                    overhead = response.json()
                    self.test_data['overheads'].append(overhead)
                    self.log_result(f"Create Overhead: {overhead_data['category']}", True, 
                                  f"Amount: ₹{overhead['amount']}")
                else:
                    self.log_result(f"Create Overhead: {overhead_data['category']}", False, 
                                  f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result(f"Create Overhead: {overhead_data['category']}", False, f"Error: {str(e)}")
        
        # READ Overheads
        try:
            response = requests.get(f"{self.base_url}/overheads", timeout=10)
            if response.status_code == 200:
                overheads = response.json()
                self.log_result("Get All Overheads", True, f"Retrieved {len(overheads)} overheads")
            else:
                self.log_result("Get All Overheads", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get All Overheads", False, f"Error: {str(e)}")
        
        # READ Overheads by Site
        try:
            response = requests.get(f"{self.base_url}/overheads?site_id={site['site_id']}", timeout=10)
            if response.status_code == 200:
                site_overheads = response.json()
                self.log_result("Get Site Overheads", True, f"Retrieved {len(site_overheads)} overheads for site")
            else:
                self.log_result("Get Site Overheads", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Get Site Overheads", False, f"Error: {str(e)}")
        
        # UPDATE Overhead
        if self.test_data['overheads']:
            overhead_to_update = self.test_data['overheads'][0].copy()
            overhead_to_update['amount'] = 600.0
            overhead_to_update['description'] = "Updated fuel and vehicle charges"
            
            try:
                response = requests.put(f"{self.base_url}/overheads/{overhead_to_update['overhead_id']}", 
                                      json=overhead_to_update, timeout=10)
                if response.status_code == 200:
                    updated_overhead = response.json()
                    self.test_data['overheads'][0] = updated_overhead
                    self.log_result("Update Overhead", True, 
                                  f"Updated amount to: ₹{updated_overhead['amount']}")
                else:
                    self.log_result("Update Overhead", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("Update Overhead", False, f"Error: {str(e)}")

    def test_reports_api(self):
        """Test Reports API endpoints"""
        print("=== TESTING REPORTS API ===")
        
        if not self.test_data['sites']:
            self.log_result("Reports Test", False, "Missing prerequisite data (sites)")
            return
        
        site = self.test_data['sites'][0]
        
        # Test Site Report
        try:
            response = requests.get(f"{self.base_url}/reports/site/{site['site_id']}", timeout=10)
            if response.status_code == 200:
                report = response.json()
                self.log_result("Site Report", True, 
                              f"Grand Total: ₹{report.get('grand_total', 0)}, Logs: {report.get('logs_count', 0)}")
                
                # Verify report structure
                required_fields = ['site', 'total_material_cost', 'total_labour_cost', 'total_overhead_cost', 'grand_total']
                has_all_fields = all(field in report for field in required_fields)
                self.log_result("Site Report Structure", has_all_fields, 
                              "All required fields present" if has_all_fields else "Missing required fields")
            else:
                self.log_result("Site Report", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Site Report", False, f"Error: {str(e)}")
        
        # Test Daily Report
        try:
            response = requests.get(f"{self.base_url}/reports/daily", timeout=10)
            if response.status_code == 200:
                report = response.json()
                self.log_result("Daily Report (All)", True, 
                              f"Total Cost: ₹{report.get('total_cost', 0)}, Logs: {len(report.get('logs', []))}")
            else:
                self.log_result("Daily Report (All)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Daily Report (All)", False, f"Error: {str(e)}")
        
        # Test Daily Report with date filter
        try:
            response = requests.get(f"{self.base_url}/reports/daily?date=2025-01-15", timeout=10)
            if response.status_code == 200:
                report = response.json()
                self.log_result("Daily Report (Filtered)", True, 
                              f"Date: {report.get('date')}, Logs: {len(report.get('logs', []))}")
            else:
                self.log_result("Daily Report (Filtered)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Daily Report (Filtered)", False, f"Error: {str(e)}")
        
        # Test Inventory Report
        try:
            response = requests.get(f"{self.base_url}/reports/inventory", timeout=10)
            if response.status_code == 200:
                report = response.json()
                self.log_result("Inventory Report", True, 
                              f"Total Stock Value: ₹{report.get('total_stock_value', 0)}, Low Stock Items: {len(report.get('low_stock_items', []))}")
                
                # Verify report structure
                required_fields = ['materials', 'total_stock_value', 'low_stock_items']
                has_all_fields = all(field in report for field in required_fields)
                self.log_result("Inventory Report Structure", has_all_fields,
                              "All required fields present" if has_all_fields else "Missing required fields")
            else:
                self.log_result("Inventory Report", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Inventory Report", False, f"Error: {str(e)}")

    def test_excel_exports(self):
        """Test Excel Export endpoints"""
        print("=== TESTING EXCEL EXPORTS ===")
        
        if not self.test_data['sites']:
            self.log_result("Excel Export Test", False, "Missing prerequisite data (sites)")
            return
        
        site = self.test_data['sites'][0]
        
        # Test Site Report Excel Export
        try:
            response = requests.get(f"{self.base_url}/export/site/{site['site_id']}", timeout=15)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                is_excel = 'spreadsheet' in content_type or 'excel' in content_type
                file_size = len(response.content)
                
                self.log_result("Site Report Excel Export", True, 
                              f"File size: {file_size} bytes, Content-Type: {content_type}")
                self.log_result("Site Excel Content Type", is_excel,
                              "Correct Excel content type" if is_excel else f"Unexpected content type: {content_type}")
            else:
                self.log_result("Site Report Excel Export", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Site Report Excel Export", False, f"Error: {str(e)}")
        
        # Test Inventory Report Excel Export
        try:
            response = requests.get(f"{self.base_url}/export/inventory", timeout=15)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                is_excel = 'spreadsheet' in content_type or 'excel' in content_type
                file_size = len(response.content)
                
                self.log_result("Inventory Report Excel Export", True, 
                              f"File size: {file_size} bytes, Content-Type: {content_type}")
                self.log_result("Inventory Excel Content Type", is_excel,
                              "Correct Excel content type" if is_excel else f"Unexpected content type: {content_type}")
            else:
                self.log_result("Inventory Report Excel Export", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Inventory Report Excel Export", False, f"Error: {str(e)}")

    def cleanup_test_data(self):
        """Clean up test data (optional)"""
        print("=== CLEANUP (Optional) ===")
        
        # Delete test sites (this will cascade delete logs and overheads)
        for site in self.test_data['sites'][1:]:  # Keep first site for reference
            try:
                response = requests.delete(f"{self.base_url}/sites/{site['site_id']}", timeout=10)
                if response.status_code == 200:
                    self.log_result(f"Delete Site: {site['name']}", True, "Site and related data deleted")
                else:
                    self.log_result(f"Delete Site: {site['name']}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(f"Delete Site: {site['name']}", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Backend API Tests for Painting Contractor App")
        print("=" * 80)
        
        # Health check first
        if not self.test_health_check():
            print("❌ API is not accessible. Stopping tests.")
            return
        
        # Run all tests
        self.test_sites_crud()
        self.test_materials_crud()
        self.test_labours_crud()
        self.test_daily_logs_with_stock_management()  # Critical tests
        self.test_overheads_crud()
        self.test_reports_api()
        self.test_excel_exports()
        
        # Optional cleanup
        # self.cleanup_test_data()
        
        # Summary
        print("=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if "✅ PASS" in r['status']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result['status']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n🎯 CRITICAL STOCK MANAGEMENT TESTS:")
        critical_tests = [r for r in self.test_results if any(keyword in r['test'].lower() 
                         for keyword in ['stock reduction', 'stock restoration', 'stock update'])]
        for test in critical_tests:
            print(f"  {test['status']}: {test['test']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = PaintingContractorAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)