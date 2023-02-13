import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: {
        message: 'Arquivo obrigatório',
        value: true,
      },
      validate: {
        lessThen10MB: (files: FileList) => {
          const file = files[0];

          return (
            file.size < 10 * 1024 * 1024 || 'O arquivo deve ser menor que 10MB'
          );
        },
        acceptedFormats: (files: FileList) => {
          const file = files[0];

          return file.type.match(/image\/(jpeg|png|gif)/).length
            ? true
            : 'Somente são aceitos arquivos PNG, JPEG e GIF';
        },
      },
    },
    title: {
      required: {
        message: 'Título obrigatório',
        value: true,
      },
      minLength: {
        message: 'Mínimo de 2 caracteres',
        value: 2,
      },
      maxLength: {
        message: 'Máximo de 20 caracteres',
        value: 20,
      },
    },
    description: {
      required: {
        message: 'Descrição obrigatória',
        value: true,
      },
      maxLength: {
        message: 'Máximo de 65 caracteres',
        value: 65,
      },
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (data: Record<string, unknown>) => {
      return api.post('/api/images', data);
    },
    {
      onSuccess: () => queryClient.invalidateQueries('images'),
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async ({
    title,
    description,
  }: Record<string, unknown>): Promise<void> => {
    const data = { url: imageUrl, title, description };

    try {
      if (!imageUrl) {
        toast({
          status: 'info',
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
        });
      } else {
        await mutation.mutateAsync(data);
        toast({
          status: 'success',
          title: 'Imagem cadastrada',
          description: 'Sua imagem foi cadastrada com sucesso.',
        });
      }
    } catch {
      toast({
        status: 'error',
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
      });
    } finally {
      reset();
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors?.image}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors?.title}
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors?.description}
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
