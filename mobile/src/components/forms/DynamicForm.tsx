import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Colors } from '../../constants/colors';

export interface FormOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'phone' | 'password' | 'number' | 'textarea' | 'radio' | 'dropdown';
  options?: FormOption[];
  required?: boolean;
  dependsOn?: {
    field: string;
    value: string | string[];
  };
}

interface DynamicFormProps {
  fields: FormFieldConfig[];
  schema?: ZodType<any, any, any>;
  defaultValues?: Record<string, any>;
  submitLabel?: string;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  loading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  schema,
  defaultValues = {},
  submitLabel = 'Submit',
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  const watchedValues = watch();

  return (
    <View style={styles.container}>
      {fields.map((field) => {
        // Evaluate conditional visibility
        if (field.dependsOn) {
          const parentVal = watchedValues[field.dependsOn.field];
          const expected = field.dependsOn.value;
          const isVisible = Array.isArray(expected)
            ? expected.includes(parentVal)
            : parentVal === expected;
          if (!isVisible) return null;
        }

        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Controller
              control={control}
              name={field.name}
              rules={{ required: field.required ? 'This field is required' : false }}
              render={({ field: { onChange, value } }) => {
                if (field.type === 'radio' && field.options) {
                  return (
                    <View style={styles.radioGroup}>
                      <Text style={styles.label}>
                        {field.label}
                        {field.required && <Text style={styles.required}> *</Text>}
                      </Text>
                      <View style={styles.radioOptionsRow}>
                        {field.options.map((opt) => {
                          const isSelected = value === opt.value;
                          return (
                            <TouchableOpacity
                              key={opt.value}
                              style={[styles.radioChip, isSelected && styles.radioChipSelected]}
                              onPress={() => onChange(opt.value)}
                            >
                              <Text
                                style={[styles.radioText, isSelected && styles.radioTextSelected]}
                              >
                                {opt.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {errors[field.name] && (
                        <Text style={styles.errorText}>
                          {String(errors[field.name]?.message || '')}
                        </Text>
                      )}
                    </View>
                  );
                }

                return (
                  <Input
                    label={`${field.label}${field.required ? ' *' : ''}`}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={value !== undefined ? String(value) : ''}
                    onChangeText={(val) => {
                      if (field.type === 'number') {
                        onChange(val === '' ? '' : Number(val));
                      } else {
                        onChange(val);
                      }
                    }}
                    keyboardType={
                      field.type === 'email'
                        ? 'email-address'
                        : field.type === 'phone'
                        ? 'phone-pad'
                        : field.type === 'number'
                        ? 'numeric'
                        : 'default'
                    }
                    isPassword={field.type === 'password'}
                    multiline={field.type === 'textarea'}
                    numberOfLines={field.type === 'textarea' ? 4 : 1}
                    style={field.type === 'textarea' ? styles.textarea : undefined}
                    error={errors[field.name]?.message as string}
                  />
                );
              }}
            />
          </View>
        );
      })}

      <Button
        title={submitLabel}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  radioChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: Colors.text,
  },
  radioTextSelected: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 16,
  },
});

