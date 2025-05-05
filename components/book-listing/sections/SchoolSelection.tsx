'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toastService } from '@/services/toastService';

interface SchoolType {
  id: number;
  name: string;
  address: string | null;
}

interface SchoolSelectionProps {
  selectedSchool: string;
  onChange: (school: string) => void;
}

const SchoolSelection: React.FC<SchoolSelectionProps> = ({ selectedSchool, onChange }) => {
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [schoolOptions, setSchoolOptions] = useState<SchoolType[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolType[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch schools from API
  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      try {
        const response = await axios.get('http://localhost:8081/schools');
        if (response.data.code === 1000 && Array.isArray(response.data.result)) {
          setSchoolOptions(response.data.result);
          setFilteredSchools(response.data.result);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
        toastService.error('Không thể tải dữ liệu trường học. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingSchools(false);
      }
    };
    
    fetchSchools();
  }, []);

  // Filter schools based on search term
  useEffect(() => {
    if (schoolSearchTerm.trim() === '') {
      setFilteredSchools(schoolOptions);
    } else {
      const lowercasedTerm = schoolSearchTerm.toLowerCase();
      const filtered = schoolOptions.filter(school => 
        school.name.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredSchools(filtered);
    }
  }, [schoolSearchTerm, schoolOptions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setShowSchoolDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Trường học
      </label>
      <div className="relative" ref={schoolDropdownRef}>
        <div 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
        >
          <span className={selectedSchool ? '' : 'text-gray-500'}>
            {isLoadingSchools 
              ? 'Đang tải trường học...' 
              : selectedSchool 
                ? schoolOptions.find(school => school.id.toString() === selectedSchool)?.name 
                : 'Chọn trường học'}
          </span>
          <ChevronDown size={20} className={`text-gray-500 transition-transform duration-200 ${showSchoolDropdown ? 'rotate-180' : ''}`} />
        </div>
        
        {showSchoolDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-2 border-b">
              <div className="relative">
                <input
                  type="text"
                  value={schoolSearchTerm}
                  onChange={(e) => setSchoolSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm trường học..."
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {isLoadingSchools ? (
                <div className="px-4 py-2 text-gray-500">Đang tải trường học...</div>
              ) : (
                <>
                  <div 
                    onClick={() => {
                      onChange('');
                      setShowSchoolDropdown(false);
                    }}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${!selectedSchool ? 'bg-gray-100' : ''}`}
                  >
                    Không chọn
                  </div>
                  {filteredSchools.map((school) => (
                    <div
                      key={school.id}
                      onClick={() => {
                        onChange(school.id.toString());
                        setShowSchoolDropdown(false);
                      }}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        selectedSchool === school.id.toString() ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      {school.name}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolSelection; 