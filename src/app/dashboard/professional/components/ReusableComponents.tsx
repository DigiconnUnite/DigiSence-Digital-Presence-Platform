"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  UserCheck, 
  Globe, 
  Activity, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Edit,
  X
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  truncate?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  truncate = false 
}) => {
  const { themeSettings } = React.useContext(require('@/contexts/ThemeContext').ThemeContext);

  return (
    <Card
      className={`${themeSettings.cardClass} ${themeSettings.borderRadius} transition-all duration-300 hover:shadow-lg`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold text-gray-900 ${truncate ? "truncate" : ""}`}
        >
          {value}
        </div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonAction: () => void;
  disabled?: boolean;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  buttonAction,
  disabled = false,
  variant = "default",
}) => {
  const { themeSettings } = React.useContext(require('@/contexts/ThemeContext').ThemeContext);

  return (
    <Card
      className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className={`w-full ${variant === "outline" ? "" : themeSettings.buttonStyle}`}
          variant={variant}
          onClick={buttonAction}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

interface SkillCardProps {
  skill: {
    name: string;
    level: "beginner" | "intermediate" | "expert" | "master";
  };
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, index, onEdit, onDelete }) => {
  const levelColors = {
    beginner: "text-gray-600",
    intermediate: "text-blue-600",
    expert: "text-purple-600",
    master: "text-amber-600",
  };

  const levelLabels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
    master: "Master",
  };

  const levelIcons = {
    beginner: <Award className="h-4 w-4" />,
    intermediate: <Award className="h-4 w-4" />,
    expert: <Award className="h-4 w-4" />,
    master: <Crown className="h-4 w-4" />,
  };

  const { themeSettings } = React.useContext(require('@/contexts/ThemeContext').ThemeContext);

  return (
    <Card key={index} className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${skill.level === 'beginner' ? 'from-gray-100 to-gray-200' :
              skill.level === 'intermediate' ? 'from-blue-100 to-blue-200' :
                skill.level === 'expert' ? 'from-purple-100 to-purple-200' :
                  'from-amber-100 to-orange-100'
              } flex items-center justify-center`}>
              <div className={levelColors[skill.level]}>
                {levelIcons[skill.level]}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 text-lg">
              {skill.name}
            </h4>
            <p className={`${levelColors[skill.level]} font-medium text-sm mb-1`}>
              {levelLabels[skill.level]}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(index)}
              className={themeSettings.borderRadius}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(index)}
              className={`${themeSettings.borderRadius} text-red-600 hover:text-red-700 hover:bg-red-50`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ExperienceCardProps {
  experience: {
    position: string;
    company: string;
    location?: string;
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    isCurrent?: boolean;
  };
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, index, onEdit, onDelete }) => {
  const formatDuration = (item: any) => {
    if (item.startMonth && item.startYear) {
      const start = `${item.startMonth} ${item.startYear}`;
      const end = item.isCurrent ? 'Present' : (item.endMonth && item.endYear ? `${item.endMonth} ${item.endYear}` : '');
      return end ? `${start} - ${end}` : start;
    }
    return item.duration || '';
  };

  const { themeSettings } = React.useContext(require('@/contexts/ThemeContext').ThemeContext);

  return (
    <Card key={index} className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 text-lg">
              {experience.position}
            </h4>
            <p className="text-blue-600 font-medium text-sm mb-1">
              {experience.company}{experience.location ? ` • ${experience.location}` : ''}
            </p>
            <p className="text-sm text-gray-600">
              {formatDuration(experience)}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(index)}
              className={themeSettings.borderRadius}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(index)}
              className={`${themeSettings.borderRadius} text-red-600 hover:text-red-700 hover:bg-red-50`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ServiceCardProps {
  service: {
    name: string;
    description: string;
    price?: string;
  };
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onEdit, onDelete }) => {
  const { themeSettings } = React.useContext(require('@/contexts/ThemeContext').ThemeContext);

  return (
    <Card key={index} className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg">
              {service.name}
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed mb-2">
              {service.description}
            </p>
            {service.price && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                {service.price}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(index)}
              className={themeSettings.borderRadius}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(index)}
              className={`${themeSettings.borderRadius} text-red-600 hover:text-red-700 hover:bg-red-50`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PortfolioCardProps {
  portfolio: {
    title: string;
    description: string;
    url: string;
  };
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, index, onEdit, onDelete }) => {
  const { themeSettings } = React.useContext(require('@/contexts/ThemeContext').ThemeContext);

  return (
    <Card key={index} className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Image className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg">
              {portfolio.title}
            </h4>
            <p className="text-green-600 font-medium text-sm mb-1">
              Portfolio Item
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {portfolio.description}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(index)}
              className={themeSettings.borderRadius}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(index)}
              className={`${themeSettings.borderRadius} text-red-600 hover:text-red-700 hover:bg-red-50`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface EducationCardProps {
  education: {
    degree: string;
    institution: string;
    year: string;
    description?: string;
  };
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const EducationCard: React.FC<EducationCardProps> = ({ education, index, onEdit, onDelete }) => {
  const { themeSettings } = React.useContext(require('@/contexts/ThemeContext').ThemeContext);

  return (
    <Card key={index} className={`${themeSettings.cardClass} rounded-md ${themeSettings.borderRadius}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 text-lg">
              {education.degree}
            </h4>
            <p className="text-green-600 font-medium text-sm mb-1">
              {education.institution}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {education.year}
            </p>
            {education.description && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {education.description}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(index)}
              className={themeSettings.borderRadius}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(index)}
              className={`${themeSettings.borderRadius} text-red-600 hover:text-red-700 hover:bg-red-50`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Import missing icons
import { Building2, Package, Image, Award, Crown, GraduationCap } from "lucide-react";